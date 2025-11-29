import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import os  
import base64


PRIME = 257

def mod_inv(a, p):
    """
    Находит обратный элемент для 'a' по модулю 'p' (a^-1 mod p).
    Используем Малую теорему Ферма: a^(p-2) mod p.
    """
    return pow(a, p - 2, p)

def evaluate_poly(poly, x, p):
    """Вычисляет значение полинома f(x) по модулю p."""
    result = 0
    # Вычисляем, используя схему Горнера для эффективности
    for coeff in reversed(poly):
        result = (result * x + coeff) % p
    return result

def lagrange_interpolate(points, x_at, p):
    """
    Находит значение полинома в точке x_at (у нас это x=0), 
    используя интерполяцию Лагранжа.
    points - это список пар (x, y)
    """
    k = len(points)
    xs, ys = zip(*points)
    
    result = 0
    
    for j in range(k):
        # Строим j-й базисный полином Лагранжа L_j(x)
        numerator = 1
        denominator = 1
        
        for i in range(k):
            if i == j:
                continue
            
            # L_j(x_at) = П (x_at - x_i) / (x_j - x_i)
            numerator = (numerator * (x_at - xs[i])) % p
            denominator = (denominator * (xs[j] - xs[i])) % p
            
        # (num * den^-1) mod p
        term = (ys[j] * numerator * mod_inv(denominator, p)) % p
        result = (result + term) % p
        
    return result % p


# --- Логика схемы Шамира ---

def split_secret(secret_str: str, k: int, n: int) -> list[str]:
    """
    Делит секрет на N частей, K из которых нужны для восстановления.
    """
    if k > n:
        raise ValueError("Порог (k) не может быть больше числа частей (n)")
        
    secret_bytes = secret_str.encode('utf-8')
    
    shares = [[] for _ in range(n)]
    
    # 1. Проходим по каждому байту секрета
    for byte in secret_bytes:
        # 2. Генерируем случайный полином степени k-1
        # f(x) = S + a1*x + ... + a(k-1)*x^(k-1)
        # Секрет (S) - это наш байт (свободный член)
        
        coeffs = [os.urandom(1)[0] + 1 for _ in range(k - 1)]
        poly = [byte] + coeffs
     
        
        # 3. Генерируем N точек (частей) для этого полинома
        for i in range(1, n + 1):
            x = i
            y = evaluate_poly(poly, x, PRIME)
            # Добавляем точку (x, y) к i-й части
            shares[i-1].append(y)
            
    # 4. Кодируем части для вывода
    output_shares = []
    for i in range(n):
        x_coord = i + 1
        y_coords_str = ",".join(str(y) for y in shares[i])
        share_data = f"{x_coord}:{y_coords_str}"
        share_b64 = base64.b64encode(share_data.encode('utf-8')).decode('utf-8')
        output_shares.append(share_b64)
        
    return output_shares

def reconstruct_secret(parts_b64: list[str]) -> str:
    """
    Восстанавливает секрет из K или более частей.
    """
    
    decoded_parts = []
    try:
        for b64_part in parts_b64:
            decoded_data = base64.b64decode(b64_part).decode('utf-8')
            x_str, y_str = decoded_data.split(':', 1)
            x = int(x_str)
            ys = [int(y) for y in y_str.split(',')]
            decoded_parts.append((x, ys))
    except Exception as e:
        raise ValueError(f"Ошибка декодирования части: {e}")

    k = len(decoded_parts) 
    if k == 0:
        raise ValueError("Нет частей для восстановления")

    secret_len = len(decoded_parts[0][1])
    if not all(len(p[1]) == secret_len for p in decoded_parts):
        raise ValueError("Части секрета имеют разную длину.")

    secret_bytes_list = []
    
    for i in range(secret_len):
        points = []
        for x, ys in decoded_parts:
            points.append((x, ys[i]))
            
        secret_byte = lagrange_interpolate(points, 0, PRIME)
        secret_bytes_list.append(secret_byte)
        
    try:
        return bytes(secret_bytes_list).decode('utf-8')
    except UnicodeDecodeError:
        return f"[Ошибка декодирования UTF-8. HEX: {bytes(secret_bytes_list).hex()}]"


# --- Графический интерфейс (GUI) ---
# (GUI код остался без изменений, он не зависел от 'random')

class ShamirApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Совершенная Схема Шамира (k, n) [Crypto-Secure]")
        self.geometry("650x650")

        # --- Фрейм 1: Разделение секрета ---
        split_frame = ttk.LabelFrame(self, text="1. Разделить секрет")
        split_frame.pack(padx=10, pady=10, fill="x")

        ttk.Label(split_frame, text="Ваш секрет:").pack(anchor="w", padx=5)
        self.secret_entry = ttk.Entry(split_frame, width=80)
        self.secret_entry.pack(padx=5, pady=5, fill="x")

        k_frame = ttk.Frame(split_frame)
        k_frame.pack(fill="x", padx=5, pady=5)
        
        ttk.Label(k_frame, text="Разделить на (n):").pack(side="left")
        self.n_spinbox = ttk.Spinbox(k_frame, from_=2, to=20, width=5)
        self.n_spinbox.set("5")
        self.n_spinbox.pack(side="left", padx=5)

        ttk.Label(k_frame, text="Порог (k):").pack(side="left", padx=(10, 0))
        self.k_spinbox = ttk.Spinbox(k_frame, from_=2, to=20, width=5)
        self.k_spinbox.set("3")
        self.k_spinbox.pack(side="left", padx=5)

        self.split_button = ttk.Button(k_frame, text="Разделить!", command=self.on_split)
        self.split_button.pack(side="left", padx=10)

        ttk.Label(split_frame, text="Полученные части (в Base64):").pack(anchor="w", padx=5, pady=(10,0))
        self.parts_output = scrolledtext.ScrolledText(split_frame, height=10, wrap=tk.WORD)
        self.parts_output.pack(padx=5, pady=5, fill="x")

        # --- Фрейм 2: Сборка секрета ---
        reconstruct_frame = ttk.LabelFrame(self, text="2. Собрать секрет")
        reconstruct_frame.pack(padx=10, pady=10, fill="x")

        ttk.Label(reconstruct_frame, text="Вставьте сюда K (или больше) частей (каждую с новой строки):").pack(anchor="w", padx=5)
        self.parts_input = scrolledtext.ScrolledText(reconstruct_frame, height=10, wrap=tk.WORD)
        self.parts_input.pack(padx=5, pady=5, fill="x")

        self.reconstruct_button = ttk.Button(reconstruct_frame, text="Собрать секрет!", command=self.on_reconstruct)
        self.reconstruct_button.pack(pady=5)

        ttk.Label(reconstruct_frame, text="Восстановленный секрет:").pack(anchor="w", padx=5, pady=(10,0))
        self.reconstructed_output = ttk.Entry(reconstruct_frame, width=80, state="readonly")
        self.reconstructed_output.pack(padx=5, pady=5, fill="x")

    def on_split(self):
        secret = self.secret_entry.get()
        try:
            k = int(self.k_spinbox.get())
            n = int(self.n_spinbox.get())
        except ValueError:
            messagebox.showerror("Ошибка", "K и N должны быть целыми числами.")
            return

        if not secret:
            messagebox.showwarning("Внимание", "Поле секрета не может быть пустым.")
            return

        try:
            parts = split_secret(secret, k, n)
            self.parts_output.delete("1.0", tk.END)
            self.parts_output.insert("1.0", "\n".join(parts))
        except Exception as e:
            messagebox.showerror("Ошибка разделения", str(e))

    def on_reconstruct(self):
        parts_str = self.parts_input.get("1.0", tk.END)
        parts_list = [part.strip() for part in parts_str.split("\n") if part.strip()]
        
        if not parts_list:
            messagebox.showwarning("Внимание", "Вставьте части секрета в текстовое поле.")
            return
        
        try:
            # Проверяем k, хотя бы для UX
            k_needed = int(self.k_spinbox.get())
            if len(parts_list) < k_needed:
                 messagebox.showwarning("Внимание", f"Для восстановления нужно {k_needed} частей, а вы ввели {len(parts_list)}")
        except Exception:
            pass 

        try:
            reconstructed = reconstruct_secret(parts_list)
            
            self.reconstructed_output.config(state="normal")
            self.reconstructed_output.delete(0, tk.END)
            self.reconstructed_output.insert(0, reconstructed)
            self.reconstructed_output.config(state="readonly")
            
        except Exception as e:
            messagebox.showerror("Ошибка сборки", f"Не удалось собрать секрет. (Возможно, частей < k или части повреждены).\n\nОшибка: {e}")
            self.reconstructed_output.config(state="normal")
            self.reconstructed_output.delete(0, tk.END)
            self.reconstructed_output.config(state="readonly")


if __name__ == "__main__":
    app = ShamirApp()
    app.mainloop()