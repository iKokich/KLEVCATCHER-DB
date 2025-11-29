import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk, Frame, Label, Entry, Button

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding, dh
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.serialization import (
    PublicFormat, Encoding, load_pem_public_key, ParameterFormat
)
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os 

# --- Глобальные параметры DH (для простоты) ---
print("Генерация общих параметров DH (может занять несколько секунд)...")
# Генерируем параметры (p и g). Это "арена" для обмена ключами.
dh_parameters = dh.generate_parameters(generator=2, key_size=2048)
print("Параметры DH сгенерированы.")

class User:

    def __init__(self, name):
        self.name = name
        self.log_widget = None # Сюда привяжем текстовое поле
        
        # --- Добавлено для UI ---
        self.user_data_entry = None # Поле ввода
        self.send_button = None # Кнопка отправки
        
        # 1. Постоянные ключи для ЭЦП (RSA)
        self.rsa_private_key = None
        self.rsa_public_key = None
        self.rsa_public_key_pem = None # PEM-представление для "отправки"
        
        # 2. Временные ключи для обмена (DH)
        self.dh_private_key = None
        self.dh_public_key = None
        self.dh_public_key_bytes = None # Байт-представление для "отправки"
        
        # 3. Общий секрет
        self.shared_secret = None

    def log(self, message):
        """Выводит сообщение в привязанное текстовое поле GUI"""
        if self.log_widget:
            self.log_widget.config(state=tk.NORMAL)
            self.log_widget.insert(tk.END, f"{message}\n\n")
            self.log_widget.config(state=tk.DISABLED)
            self.log_widget.see(tk.END)

    def generate_rsa_keys(self):
        """Генерирует 'постоянную' пару ключей RSA для ЭЦП"""
        self.log(f"[{self.name}] Генерирую свою пару RSA ключей (для ЭЦП)...")
        self.rsa_private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        self.rsa_public_key = self.rsa_private_key.public_key()
        
        # Сохраняем публичный ключ в формате PEM (для "передачи")
        self.rsa_public_key_pem = self.rsa_public_key.public_bytes(
            encoding=Encoding.PEM,
            format=PublicFormat.SubjectPublicKeyInfo
        )
        self.log(f"[{self.name}] RSA ключи сгенерированы. Мой публичный RSA ключ:\n{self.rsa_public_key_pem.decode('utf-8')[:150]}...")

    def generate_dh_keys(self):
        """Генерирует 'временную' пару DH ключей на основе общих параметров"""
        if not dh_parameters:
            self.log("Ошибка: Параметры DH не инициализированы!")
            return
            
        self.log(f"[{self.name}] Генерирую свою 'временную' пару DH ключей...")
        self.dh_private_key = dh_parameters.generate_private_key()
        self.dh_public_key = self.dh_private_key.public_key()
        
        # Сохраняем публичный ключ в виде байтов (для "передачи")
        self.dh_public_key_bytes = self.dh_public_key.public_bytes(
            Encoding.PEM,
            PublicFormat.SubjectPublicKeyInfo
        )
        self.log(f"[{self.name}] Мой публичный DH ключ (для отправки):\n{self.dh_public_key_bytes.decode('utf-8')[:150]}...")

    def sign_dh_key(self):
        """Подписывает свой публичный DH ключ своим приватным RSA ключом"""
        if not self.rsa_private_key or not self.dh_public_key_bytes:
            self.log("Ошибка: Сначала нужно сгенерировать RSA и DH ключи!")
            return None
            
        self.log(f"[{self.name}] Подписываю свой публичный DH ключ своим приватным RSA ключом...")
        signature = self.rsa_private_key.sign(
            self.dh_public_key_bytes, # Данные, которые подписываем
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        self.log(f"[{self.name}] Подпись (ЭЦП) создана:\n{signature.hex()[:64]}...")
        return signature

    def verify_and_process_key(self, other_name, other_rsa_public_key_pem, other_dh_public_key_bytes, signature):
        """
        Проверяет подпись другого пользователя и, в случае успеха,
        вычисляет общий секретный ключ.
        """
        self.log(f"[{self.name}] Получил пакет от {other_name}. Начинаю проверку ЭЦП...")
        
        # ВНИМАНИЕ: self.dh_private_key ДОЛЖЕН БЫТЬ УЖЕ СГЕНЕРИРОВАН
        if self.dh_private_key is None:
            self.log(f"[{self.name}] КРИТИЧЕСКАЯ ОШИБКА: Мой dh_private_key == None!")
            return False

        try:
            # 1. Загружаем публичный RSA ключ другого пользователя
            other_rsa_public_key = load_pem_public_key(other_rsa_public_key_pem)
            
            # 2. Проверяем подпись
            other_rsa_public_key.verify(
                signature,
                other_dh_public_key_bytes, # Данные, которые должны были быть подписаны
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            self.log(f"[{self.name}] УСПЕХ: Подпись {other_name} верна! Я доверяю их DH ключу.")
            
            # 3. Раз подпись верна, загружаем DH ключ
            other_dh_public_key = load_pem_public_key(other_dh_public_key_bytes)
            
            # 4. Вычисляем общий секрет!
            self.log(f"[{self.name}] Вычисляю общий секрет...")
            shared_key_material = self.dh_private_key.exchange(other_dh_public_key)
            
            # 5. Используем KDF (Key Derivation Function) для получения "чистого" ключа
            hkdf = HKDF(
                algorithm=hashes.SHA256(),
                length=32, # 32 байта (256 бит)
                salt=None,
                info=b'authenticated-key-exchange',
            )
            self.shared_secret = hkdf.derive(shared_key_material)
            
            self.log(f"[{self.name}] ОБЩИЙ СЕКРЕТ ВЫЧИСЛЕН:\n{self.shared_secret.hex()}")
            return True
            
        except Exception as e:
            self.log(f"[{self.name}] ПРОВАЛ: ПРОВЕРКА ПОДПИСИ НЕ ПРОШЛА! Ошибка: {e}")
            self.shared_secret = None
            return False

    def encrypt_message(self, message):
        """Шифрует сообщение, используя вычисленный общий секрет."""
        if not self.shared_secret:
            self.log("Нет общего секрета для шифрования!")
            return None, None
        
        # Получаем сообщение из *своего* поля ввода
        message_to_send = self.user_data_entry.get()
        if not message_to_send:
            self.log("Нет данных для отправки!")
            return None, None

        self.log(f"[{self.name}] Шифрую сообщение: '{message_to_send}'")
        salt_iv = os.urandom(16) # IV (Initialization Vector), он же "соль"
        cipher = Cipher(algorithms.AES(self.shared_secret), modes.CFB(salt_iv))
        encryptor = cipher.encryptor()
        encrypted_data = encryptor.update(message_to_send.encode('utf-8')) + encryptor.finalize()
        self.log(f"[{self.name}] Зашифровано (IV + данные):\n{(salt_iv + encrypted_data).hex()}")
        
        # Очищаем поле после отправки
        self.user_data_entry.delete(0, tk.END)
        
        return salt_iv, encrypted_data

    def decrypt_message(self, salt_iv, encrypted_data):
        """Дешифрует сообщение."""
        if not self.shared_secret:
            self.log("Нет общего секрета для дешифровки!")
            return None
        
        self.log(f"[{self.name}] Дешифрую сообщение...")
        try:
            cipher = Cipher(algorithms.AES(self.shared_secret), modes.CFB(salt_iv))
            decryptor = cipher.decryptor()
            decrypted_message = decryptor.update(encrypted_data) + decryptor.finalize()
            decrypted_text = decrypted_message.decode('utf-8')
            self.log(f"[{self.name}] УСПЕХ: Сообщение: '{decrypted_text}'")
            return decrypted_text
        except Exception as e:
            self.log(f"[{self.name}] ПРОВАЛ ДЕШИФРОВКИ! {e}")
            return None

# --- Графический интерфейс (GUI) ---

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Симулятор обмена ключами с ЭЦП (DH + RSA)")
        self.root.geometry("1000x800")
        
        # --- Создаем пользователей ---
        self.alice = User("Алиса")
        self.bob = User("Боб")
        
        # --- Временное "хранилище" (имитация сети) ---
        self.alice_package = {}
        self.bob_package = {}
        
        # --- Общий фрейм ---
        main_frame = Frame(root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # --- Фрейм Алисы (слева) ---
        self.create_user_frame(main_frame, " 👤 Алиса ", self.alice)
        
        # --- Фрейм Боба (справа) ---
        self.create_user_frame(main_frame, " 👤 Боб ", self.bob)
        
        # --- Фрейм управления (внизу) ---
        control_frame = ttk.LabelFrame(root, text=" Управление Протоколом ")
        control_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # --- Шаг 1: Генерация RSA (ЭЦП) ---
        step1_frame = Frame(control_frame)
        step1_frame.pack(fill=tk.X, pady=3)
        Label(step1_frame, text="Шаг 1: Генерация 'постоянных' RSA ключей (для ЭЦП)").pack(side=tk.LEFT, padx=5)
        self.btn_step1 = Button(step1_frame, text="Сгенерировать для ВСЕХ", command=self.run_step_1)
        self.btn_step1.pack(side=tk.RIGHT, padx=5)
        
        # --- Шаг 2: Обмен Алисы ---
        step2_frame = Frame(control_frame)
        step2_frame.pack(fill=tk.X, pady=3)
        Label(step2_frame, text="Шаг 2: Алиса генерирует DH ключ, подписывает и 'отправляет' Бобу").pack(side=tk.LEFT, padx=5)
        self.btn_step2 = Button(step2_frame, text="Алиса -> Боб", command=self.run_step_2, state=tk.DISABLED)
        self.btn_step2.pack(side=tk.RIGHT, padx=5)
        
        # --- Шаг 3: Проверка Бобом и ответ ---
        step3_frame = Frame(control_frame)
        step3_frame.pack(fill=tk.X, pady=3)
        Label(step3_frame, text="Шаг 3: Боб проверяет Алису, генерирует свой ключ, подписывает и 'отправляет' ответ").pack(side=tk.LEFT, padx=5)
        self.btn_step3 = Button(step3_frame, text="Боб -> Алиса", command=self.run_step_3, state=tk.DISABLED)
        self.btn_step3.pack(side=tk.RIGHT, padx=5)
        
        # --- Шаг 4: Проверка Алисой ---
        step4_frame = Frame(control_frame)
        step4_frame.pack(fill=tk.X, pady=3)
        Label(step4_frame, text="Шаг 4: Алиса проверяет Боба. (Завершение обмена)").pack(side=tk.LEFT, padx=5)
        self.btn_step4 = Button(step4_frame, text="Алиса проверяет", command=self.run_step_4, state=tk.DISABLED)
        self.btn_step4.pack(side=tk.RIGHT, padx=5)

    def create_user_frame(self, parent, title, user_obj):
        """Хелпер для создания панели пользователя (с логом и чатом)"""
        frame = ttk.LabelFrame(parent, text=title)
        frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Лог
        log_widget = scrolledtext.ScrolledText(frame, height=20, state=tk.DISABLED, wrap=tk.WORD)
        log_widget.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        user_obj.log_widget = log_widget # Привязываем лог к объекту
        
        # Фрейм для отправки данных
        data_frame = Frame(frame)
        data_frame.pack(fill=tk.X, padx=5, pady=5)
        
        Label(data_frame, text="Сообщение:").pack(side=tk.LEFT)
        user_entry = Entry(data_frame)
        user_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        
        # Кнопка "отправить"
        # Используем lambda, чтобы передать, KTO отправляет
        send_button = Button(data_frame, text="Отправить ➔", 
                             command=lambda: self.run_test_encryption(user_obj), 
                             state=tk.DISABLED)
        send_button.pack(side=tk.RIGHT)
        
        # Привязываем объекты GUI к пользователю
        user_obj.user_data_entry = user_entry
        user_obj.send_button = send_button


    def run_step_1(self):
        """Генерация RSA ключей для обоих"""
        self.alice.generate_rsa_keys()
        self.bob.generate_rsa_keys()
        
        self.btn_step1.config(state=tk.DISABLED, text="RSA ключи сгенерированы")
        self.btn_step2.config(state=tk.NORMAL)

    def run_step_2(self):
        """Алиса генерирует DH, подписывает и "отправляет" """
        self.alice.generate_dh_keys()
        signature = self.alice.sign_dh_key()
        
        if signature:
            # "Отправляем" Бобу. В реальности это пакет в сети.
            self.alice_package = {
                "rsa_public_key_pem": self.alice.rsa_public_key_pem,
                "dh_public_key_bytes": self.alice.dh_public_key_bytes,
                "signature": signature
            }
            self.alice.log(f"[{self.alice.name}] 'Отправляю' пакет Бобу.")
            
            self.btn_step2.config(state=tk.DISABLED)
            self.btn_step3.config(state=tk.NORMAL)
        else:
            messagebox.showerror("Ошибка", "Не удалось создать подпись.")

    def run_step_3(self):
        """Боб получает пакет Алисы, генерирует СВОИ ключи, проверяет Алису и отправляет ответ"""
        
        # 1. Боб генерирует СВОИ DH-ключи ПЕРЕД проверкой.
        #    (Это исправляет ошибку 'NoneType')
        self.bob.generate_dh_keys()

        # 2. Теперь Боб проверяет Алису и вычисляет секрет
        #    (Теперь у него есть self.dh_private_key для .exchange())
        success = self.bob.verify_and_process_key(
            "Алиса",
            self.alice_package["rsa_public_key_pem"],
            self.alice_package["dh_public_key_bytes"],
            self.alice_package["signature"]
        )
        
        if not success:
            messagebox.showerror("ПРОВАЛ АУТЕНТИФИКАЦИИ", "Боб не смог проверить подпись Алисы! Обмен остановлен.")
            return

        # 3. Боб готовит свой ответ (ключи уже сгенерированы в п.1)
        signature = self.bob.sign_dh_key()
        
        if signature:
            # "Отправляем" Алисе.
            self.bob_package = {
                "rsa_public_key_pem": self.bob.rsa_public_key_pem,
                "dh_public_key_bytes": self.bob.dh_public_key_bytes,
                "signature": signature
            }
            self.bob.log(f"[{self.bob.name}] 'Отправляю' ответный пакет Алисе.")
            
            self.btn_step3.config(state=tk.DISABLED)
            self.btn_step4.config(state=tk.NORMAL)
        else:
            messagebox.showerror("Ошибка", "Боб не смог создать свою подпись.")
            
    def run_step_4(self):
        """Алиса получает ответ Боба и проверяет его"""
        
        success = self.alice.verify_and_process_key(
            "Боб",
            self.bob_package["rsa_public_key_pem"],
            self.bob_package["dh_public_key_bytes"],
            self.bob_package["signature"]
        )
        
        if not success:
            messagebox.showerror("ПРОВАЛ АУТЕНТИФИКАЦИИ", "Алиса не смогла проверить подпись Боба! Обмен остановлен.")
            return

        # Проверка, что секреты совпали
        if self.alice.shared_secret == self.bob.shared_secret and self.alice.shared_secret is not None:
            self.alice.log("\n--- СЕКРЕТЫ СОВПАЛИ! КАНАЛ УСТАНОВЛЕН! ---")
            self.bob.log("\n--- СЕКРЕТЫ СОВПАЛИ! КАНАЛ УСТАНОВЛЕН! ---")
            
            self.btn_step4.config(state=tk.DISABLED, text="Обмен Завершен")
            
            # !!! АКТИВИРУЕМ КНОПКИ ЧАТА !!!
            self.alice.send_button.config(state=tk.NORMAL)
            self.bob.send_button.config(state=tk.NORMAL)
        else:
            # Добавил проверку на None, чтобы было понятнее
            if self.alice.shared_secret is None or self.bob.shared_secret is None:
                messagebox.showerror("Критическая Ошибка", "Один из секретов не был вычислен (None)!")
            else:
                messagebox.showerror("Критическая Ошибка", "Секреты не совпали! Ошибка в логике.")

    def run_test_encryption(self, sender):
    
        receiver = self.bob if sender == self.alice else self.alice
        
        # 1. Отправитель шифрует (сообщение берется из его поля)
        iv, encrypted_data = sender.encrypt_message(None) # None, т.к. метод сам возьмет из Entry
        
        if iv and encrypted_data:
            # 2. "Отправляем" шифртекст
            sender.log(f"[{sender.name}] 'Отправляю' шифртекст {receiver.name}...")
            receiver.log(f"[{receiver.name}] 'Получил' шифртекст...")
            
            # 3. Получатель дешифрует
            receiver.decrypt_message(iv, encrypted_data)


if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()