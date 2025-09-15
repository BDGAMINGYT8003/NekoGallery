export const handleDownload = (imageUrl: string) => {
  try {
    const downloadUrl = `/download?url=${encodeURIComponent(imageUrl)}`;
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;

    // The 'download' attribute is not strictly necessary when Content-Disposition is set,
    // but it can be a good fallback. We can suggest a name.
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'image.jpg';
    a.setAttribute('download', filename);

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error initiating download:', error);
    throw error;
  }
};
