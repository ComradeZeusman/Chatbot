$(document).ready(function() {
    let isSpeechEnabled = true;
  
    function toggleSpeech() {
      isSpeechEnabled = !isSpeechEnabled;
      $('#toggleSpeechButton').text(isSpeechEnabled ? 'Disable Speech' : 'Enable Speech');
    }
  
    $('#toggleSpeechButton').click(function() {
      toggleSpeech();
    });
  
    function speakResponse(text) {
      if (isSpeechEnabled) {
        const apiKey = 'Your_api_key'; 
        const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  
        const requestData = {
          input: {
            text: text
          },
          voice: {
            languageCode: 'en-GB', // British English
      ssmlGender: 'FEMALE' // Female voice
          },
          audioConfig: {
            audioEncoding: 'MP3' // Replace with desired audio format
          }
        };
  
        $.ajax({
          type: 'POST',
          url: endpoint,
          contentType: 'application/json',
          data: JSON.stringify(requestData),
          success: function(data) {
            const audioContent = data.audioContent;
            const audioBlob = base64ToBlob(audioContent, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = audioUrl;
            audioPlayer.play();
          },
          error: function(xhr, status, error) {
            console.error('Error synthesizing speech:', error);
          }
        });
      }
    }
  
    function base64ToBlob(base64Data, contentType) {
      const sliceSize = 1024;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
  
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
  
      return new Blob(byteArrays, { type: contentType });
    }
  
    $('#userInputForm').submit(function(event) {
    event.preventDefault();
    const userInput = $('#userInput').val();
    $('#loadingSpinner').removeClass('d-none');
  
    $.ajax({
      type: 'POST',
      url: '/send-message',
      data: { userInput: userInput },
      success: function(response) {
        const formattedResponse = formatBotResponse(response);
  
        // Append bot's response after receiving it from the server
        $('#chatMessages').append(`
          <div class="message bot-message">
            <div class="bubble">${formattedResponse}</div>
            <img src="https://th.bing.com/th/id/R.0d8ae648e1b69dddce23fabb9050633c?rik=F4x56IhVCprrLg&pid=ImgRaw&r=0" alt="User Icon" class="user-icon">
          </div>
        `);
  
        // Append user's input above the bot's response
        const lastBotMessage = $('.message.bot-message:last');
        $(`
          <div class="message user-message">
            <div class="bubble">${userInput}</div>
            <img src="https://th.bing.com/th/id/R.8e2c571ff125b3531705198a15d3103c?rik=gzhbzBpXBa%2bxMA&riu=http%3a%2f%2fpluspng.com%2fimg-png%2fuser-png-icon-big-image-png-2240.png&ehk=VeWsrun%2fvDy5QDv2Z6Xm8XnIMXyeaz2fhR3AgxlvxAc%3d&risl=&pid=ImgRaw&r=0" alt="User Icon" class="user-icon">
          </div>
        `).insertBefore(lastBotMessage);
  
        $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
        $('#userInput').val('');
        $('#loadingSpinner').addClass('d-none');
        
        speakBotReply(); // Trigger speech synthesis after appending bot's response
      },
      error: function() {
        $('#loadingSpinner').addClass('d-none');
      }
    });
  });
  
  
    function speakBotReply() {
      const lastBotResponse = $('.message.bot-message:last-child .bubble').last().text();
      if (lastBotResponse) {
        speakResponse(lastBotResponse);
      }
    }
  
    function formatBotResponse(response) {
      let formattedResponse = '<div class="bubble">';
     
      const lines = response.split('\n'); // Split response into lines
  
      lines.forEach(line => {
        // Check if the line starts with a number followed by a dot (e.g., "1.")
        if (/^\d+\./.test(line.trim())) {
          formattedResponse += `<li>${line.trim()}</li>`; // Format as bulleted list item
        } else if (/^[a-zA-Z]+\./.test(line.trim())) {
          formattedResponse += `<li style="list-style-type: lower-alpha;">${line.trim()}</li>`; // Format as alphabetical list item
        } else {
          formattedResponse += `${line}<br>`; // Default formatting for regular text
        }
      });
  
      formattedResponse += '</div>';
      return formattedResponse;
    }
  
    $('#clearConversation').click(function() {
      $.ajax({
        type: 'POST',
        url: '/clear-conversation',
        success: function(response) {
          $('#chatMessages').empty();
          console.log(response);
        },
        error: function() {
          console.log('Error clearing conversation');
        }
      });
    });
  
    $('#darkModeToggle').change(function() {
      $('body').toggleClass('dark-mode');
      $('.chat-container, .user-message .bubble, .bot-message .bubble').toggleClass('dark-mode');
    });
  });
  