import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  surname: z.string().min(2, "Soyisim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  birthDate: z.string().min(4, "Doğum tarihi zorunlu"),
  gender: z.string().min(1, "Cinsiyet zorunlu"),
});
