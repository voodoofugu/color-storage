function sanitizeInputName(value: string): string {
  return (
    value
      .trim() // убираем пробелы по краям
      .replace(/\s+/g, " ") // заменяем множественные пробелы на один
      // .replace(/[^\w\s\-]/g, "") // удаляем все кроме букв, цифр, пробелов и дефиса
      .slice(0, 20)
  ); // ограничиваем длину (например, до 30 символов)
}

export default sanitizeInputName;
