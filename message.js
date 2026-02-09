let abortController = null;
let inGenerating = false;

async function sendMessage(){

    //setup elements
    const inputBox = document.getElementById('input-box');
    const chatBox = document.getElementById('chat-box');
    const stopbtn = document.getElementById('stop-btn');
    const prompt = inputBox.ariaValueMax.trim();


    //return out if no prompt
    if(!prompt) return;

    //stop generating if alrady generating 
    if(isGenerating){
        stopGenerating();
        return;
    }

    //grab the user's prompt and display it 
    chatBox.innerHTML += `<div class = "user-message">You: ${prompt}</div>`;
    inputBox.value = '';
    stopbtn.disabled = false;
    isGEnerating = true;

    try{
        //instantiate a new abort controller for this generation
        abortController = new AbortController();

        //send the prompt to the server and get the response
        //uses the signal from the abort controller to allow cancellation of the request
        const response = await fetch('http://localhost:8000/api/chat-stream',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt}),
            signal: abortController.signal
        });

        //create a div element to append the output from the DeepSeek model as it streams in 
        const botDiv = document.createElement('div');
        botDiv.className = 'bot-message';
        botDiv.textContent ='Bot: ';
        chatBox.appendChild(botDiv);

        const reader = response.body.getreader();
        
    } catch (error){

    }finally{

    }

}