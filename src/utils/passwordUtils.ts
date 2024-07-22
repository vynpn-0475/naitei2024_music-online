import bcrypt from 'bcrypt';
import { t } from 'i18next';

// Hàm mã hóa mật khẩu
export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 10; // Số lượng vòng lặp mã hóa
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(t('error.hashPassword', { error: error.message }));
  }
}

// Hàm so sánh mật khẩu
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    throw new Error(t('error.missingPassword'));
  }

  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(t('error.comparePassword', { error: error.message }));
  }
}
