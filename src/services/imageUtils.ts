export const resizeImage = (maxSize: number, file: File) => {
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.createElement('canvas');
  const resize = (): string => {
    let width = image.width;
    let height = image.height;

    if (width < height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else if (height > maxSize) {
      width *= maxSize / height;
      height = maxSize;
    }
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg');
  };

  return new Promise<string>((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject('Not an image');
    }

    reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
      image.onload = () => resolve(resize());
      image.src = readerEvent.target?.result?.toString() || '';
    };
    reader.readAsDataURL(file);
  });
};

export const cropImage = (url: string, aspectRatio: number) => {
  return new Promise<string>((resolve) => {
    const inputImage = new Image();
    inputImage.onload = () => {
      const inputWidth = inputImage.naturalWidth;
      const inputHeight = inputImage.naturalHeight;
      const inputImageAspectRatio = inputWidth / inputHeight;
      let outputWidth = inputWidth;
      let outputHeight = inputHeight;
      if (inputImageAspectRatio > aspectRatio) {
        outputWidth = inputHeight * aspectRatio;
      } else if (inputImageAspectRatio < aspectRatio) {
        outputHeight = inputWidth / aspectRatio;
      }
      const outputX = (outputWidth - inputWidth) * 0.5;
      const outputY = (outputHeight - inputHeight) * 0.5;
      const outputImage = document.createElement('canvas');
      outputImage.width = outputWidth;
      outputImage.height = outputHeight;
      outputImage.getContext('2d')?.drawImage(inputImage, outputX, outputY);
      resolve(outputImage.toDataURL('image/jpeg'));
    };

    inputImage.src = url;
  });
};
