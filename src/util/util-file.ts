import { extname } from 'path';

export const editFileName = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: any,
) => {
  // Verifica pelo mimetype ou pela extensão do arquivo (fallback para dispositivos móveis)
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i;
  const isImageMime = file?.mimetype?.startsWith('image/');
  const isImageExt = allowedExtensions.test(file?.originalname || '');

  if (!isImageMime && !isImageExt) {
    return callback(new Error('Only image files are allowed!'), false);
  }

  callback(null, true);
};

export const pdfFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf)$/)) {
    return callback(new Error('Apenas arquivos PDF são permitidos!'), false);
  }
  callback(null, true);
};
