import multer from 'multer';

const storage = multer.memoryStorage();

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file: 10MB
}).single('avatar');

const uploadMedia = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file: 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image' || file.fieldname === 'song') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'song', maxCount: 1 },
]);

export { uploadAvatar, uploadMedia };