function uploadImage() {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length === 0) {
      alert('Please select an image first.');
      return;
  }

  const file = fileInput.files[0];

  // Request a pre-signed URL from the server
  fetch(`http://localhost:3000/generate-presigned-url?filename=${file.name}&filetype=${file.type}`)
      .then(response => response.json())
      .then(data => {
          const presignedUrl = data.presignedUrl;
          const imageUrl = data.imageUrl;

          // Use the pre-signed URL to upload the image to S3
          fetch(presignedUrl, {
              method: 'PUT',
              body: file,
              headers: {
                  'Content-Type': file.type
              }
          })
          .then(() => {
              console.log('Successfully uploaded to S3:', imageUrl);
              // You can now use the 'imageUrl' in your application
          })
          .catch(error => {
              console.error('Error uploading to S3:', error);
          });
      })
      .catch(error => {
          console.error('Error getting pre-signed URL:', error);
      });

      fetch('http://localhost:3000/parse')
      .then(response => response.json())
      .then(data => {
          const item = data.item;
          const price = data.price;

          // Display the result on the screen
          document.getElementById('result').innerHTML = `Item: ${item}<br/>Price: ${price}`;
      })
}



