import { bucket } from '../config/firebase.config';

// Define the file data type
interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

// Function to upload an image
const uploadImg = async (fileData: FileData): Promise<string | null> => {
  if (!fileData.buffer) {
    return null;
  }

  // Define the file name and create a reference
  const fileName = `images/${Date.now()}_${fileData.originalname}`;
  const fileUpload = bucket.file(fileName);

  try {
    // Upload the file
    await fileUpload.save(fileData.buffer, {
      contentType: fileData.mimetype,
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();

    // Generate and return the download URL
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
    return downloadURL;
  } catch (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
};

// Function to get the current date and time in YYYY-MM-DD HH:MM:SS format
const giveCurrentDateTime = (): string => {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;
  const time = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}:${String(
    today.getSeconds()
  ).padStart(2, '0')}`;
  return `${date} ${time}`;
};

export { uploadImg };
