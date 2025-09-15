export const handleDownload = (imageUrl: string) => {
  try {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = imageUrl;

    // To trigger a download, we need to suggest a filename.
    // We also need to add the link to the DOM before clicking it.
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    a.setAttribute('download', filename);

    // For cross-origin images, the 'download' attribute might not work
    // without some extra help. We can try setting rel="noopener".
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('target', '_blank'); // Open in a new tab as a fallback

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};
