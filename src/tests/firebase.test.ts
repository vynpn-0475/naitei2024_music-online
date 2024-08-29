import { uploadImg } from '../services/LoadFirebase';
import { bucket } from '../config/firebase.config';

interface FileData {
  buffer: Buffer | null;
  originalname: string;
  mimetype: string;
}

jest.mock('../config/firebase.config', () => ({
  bucket: {
    file: jest.fn(),
  },
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

const mockTimestamp = 1724928878420;
const originalDateNow = Date.now;
beforeAll(() => {
  Date.now = jest.fn().mockReturnValue(mockTimestamp);
});
afterAll(() => {
  Date.now = originalDateNow;
});

describe('uploadImg', () => {
  it('should upload an image and return a download URL', async () => {
    const fileData: FileData = {
      buffer: Buffer.from('test image data'),
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
    };

    const mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
      makePublic: jest.fn().mockResolvedValue(undefined),
    };

    (bucket.file as jest.Mock).mockReturnValue(mockFile);

    const fileName = `images/${mockTimestamp}_${fileData.originalname}`;
    const expectedURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    const result = await uploadImg(fileData);

    expect(bucket.file).toHaveBeenCalledWith(expect.stringContaining('images/'));
    expect(mockFile.save).toHaveBeenCalledWith(fileData.buffer, { contentType: fileData.mimetype });
    expect(mockFile.makePublic).toHaveBeenCalled();

    expect(result).toEqual(expectedURL);
  });

  it('should return null if no buffer is provided', async () => {
    const fileData: FileData = {
      buffer: null,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
    };

    const result = await uploadImg(fileData);

    expect(result).toBeNull();
  });

  it('should handle errors and return null', async () => {
    const fileData: FileData = {
      buffer: Buffer.from('test image data'),
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
    };

    const mockFile = {
      save: jest.fn().mockRejectedValue(new Error('Upload failed')),
      makePublic: jest.fn(),
    };

    (bucket.file as jest.Mock).mockReturnValue(mockFile);

    const result = await uploadImg(fileData);

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('Error uploading file:', expect.any(Error));
  });
});
