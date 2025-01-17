function validateFile() {
    const fileInput = document.getElementById('fileInput');
    const errorMessage = document.getElementById('error-message');
    const file = fileInput.files[0];

    if (!file) {
        displayErrorMessage("No file selected. Please upload a text file.");
        return false;
    }

    if ((file.type && file.type !== 'text/plain') || (!file.type && !file.name.endsWith('.txt'))) {
        displayErrorMessage("Please upload a valid .txt file.");
        return false;
    }

    if (file.size === 0) {
        displayErrorMessage("The file is empty. Please upload a valid text file.");
        return false;
    }

    return true;
}

function isValidQuestionFormat(contents) {
    const questions = contents.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const questionPattern = /^[A-Z].*\?$/;
    const specificTermPattern = /^(Describe|Define|Differentiate|Classify)/;

    return questions.every(line => {
        return (
            (questionPattern.test(line) && !specificTermPattern.test(line)) || 
            (specificTermPattern.test(line) && line.endsWith('.'))
        );
    });
}

/*function isValidQuestionFormat(contents) {
    // Split the content by newlines and trim extra spaces
    const questions = contents.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    // Regular expression to check if a question ends with a question mark
    const questionPattern = /^[A-Z].*\?$/;
    
    // Pattern for specific terms (Describe, Define, Differentiate, Classify, Compare, Convert)
    const specificTermPattern = /^(Describe|Define|Differentiate|Classify|Explain|Compare|Convert)/;

    // Iterate through each line (representing a set of questions)
    return questions.every(line => {
        // Split the line into individual sub-questions based on whitespace
        const subQuestions = line.split(/\s+/).map(subQuestion => subQuestion.trim()).filter(subQuestion => subQuestion.length > 0);

        // Validate each sub-question individually
        return subQuestions.every(subQuestion => {
            return (
                // Valid question should either end with a "?" (and not be a specific term) 
                (questionPattern.test(subQuestion) && !specificTermPattern.test(subQuestion)) || 
                // Or should be a specific term question that ends with "."
                (specificTermPattern.test(subQuestion) && subQuestion.endsWith('.'))
            );
        });
    });
}*/


function displayErrorMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

document.getElementById('analyzeButton').addEventListener('click', function (event) {
    event.preventDefault();

    if (!validateFile()) {
        return;
    }

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const contents = event.target.result;

            if (isValidQuestionFormat(contents)) {
                alert("Validation successful! File content is valid.");
                sendFileForAnalysis(file);
            } else {
                displayErrorMessage("Error: The uploaded file does not contain a valid set of questions.");
            }
        };

        reader.readAsText(file);
    }
});

function sendFileForAnalysis(file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch("/analyze", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Handle the success response
        alert(data.message);  // Show the success message

        // Redirect the user to the 'results' page
        window.location.href = data.redirect_url; // Redirect to /results
    })
    .catch(error => {
        alert("Error uploading file:", error.message);
    });
}
