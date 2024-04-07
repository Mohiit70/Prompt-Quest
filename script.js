document.addEventListener("DOMContentLoaded", function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const category = button.getAttribute('data-category');
            const prompt = prompt(`Enter a prompt for the ${category} image:`);
            
            // Call function to generate image based on category and prompt
            const generatedImage = await query({ category, prompt });

            // Display the generated image
            displayImage(generatedImage);
        });
    });
});

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    return result;
}

function displayImage(imageBlob) {
    const imageUrl = URL.createObjectURL(imageBlob);
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    document.getElementById('image-container').innerHTML = '';
    document.getElementById('image-container').appendChild(imgElement);
}
