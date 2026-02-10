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

        //attaches a read to the stream
        const reader = response.body.getreader();
        //decode the stream of data chunks coming from the server (utf-8 encoded)
        const decoder = new TextDecoder();

        //loop read the stream until it done, and appends the docode text to the front-end
        //automatically scroll the window to the bottom a new content is added
        while(isGenerating){
            const {done, value} = await reader.read();
            if(done) break;
            botDiv.textContent += decoder.decode(value);
            chatBox.scrollTop = chatBox.scrollHeight;

        }

    } catch (error){
        //if there is an abort error, append that to the chat box to debug
        if(error.name ==='AbortError'){
            chatBox.innerHTML += `<div class ="bot-message"> style="color: red;">Error:${error.message}</div>`
        }

    }finally{
        //always run to display stop button and reset generating state
        stopbtn.disabled = true;
        isGenerating = false;

    }

}

function stopGeneration() {
    if(abortController){
        //calls the abort method on the controller to cancel the fetch request and stop the stream
        abortController.abort();
    }
    isGenerating = false;
    //disabled the stop button since generation has stopped
    document.getElementById("stop-btn").disabled = true;
}