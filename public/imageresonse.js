$(document).ready(function() {
    $('#imageForm').submit(function(event) {
      event.preventDefault(); // Prevent the default form submission
  
      // Get user input prompt for image generation
      const userInput = $('#imageInputField').val();
  
      // Show loading state
      $('#imageDisplay').html('<img src="Rhombus.gif"><br>Generating image...');
  
      // Make an AJAX request to generate the image
      $.ajax({
        type: 'POST',
        url: '/generate-image',
        data: { imageinput: userInput },
        success: function(imageUrl) {
          // Display the generated image in the imageDisplay div
          $('#imageDisplay').html(`<img src="${imageUrl}" alt="Generated Image">`);
        },
        error: function(error) {
          // Handle errors
          console.error('Error:', error);
          $('#imageDisplay').html('Error generating image');
        }
      });
    });
  });
  