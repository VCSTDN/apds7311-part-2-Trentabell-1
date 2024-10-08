document.addEventListener("DOMContentLoaded", () => {
    // Wait for the DOM to fully load before executing the script

    const form = document.getElementById("registrationForm");  // Get the form element
    const responseMessage = document.getElementById("message");  // Get the element for displaying messages to the user

    // Function to fetch the CSRF token from the server
    async function getCsrfToken() {
        const response = await fetch('/csrf-token');  // Make a request to get the CSRF token
        const data = await response.json();  // Parse the response as JSON
        return data.csrfToken;  // Return the token value
    }

    // Add an event listener to handle form submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();  // Prevent the default form submission behavior

        // Get values from the form fields
        const fullName = document.getElementById("fullName").value;
        const idNumber = document.getElementById("idNumber").value;
        const accountNumber = document.getElementById("accountNumber").value;
        const password = document.getElementById("password").value;

        try {
            const csrfToken = await getCsrfToken();  // Retrieve the CSRF token

            // Send a POST request to the server to register the user
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",  // Send data as JSON
                    "X-CSRF-Token": csrfToken  // Include the CSRF token in the headers
                },
                body: JSON.stringify({
                    fullName,        // Send the form values as the request body
                    idNumber,
                    accountNumber,
                    password,
                }),
            });

            const result = await response.json();  // Parse the server's response as JSON
            responseMessage.textContent = result.message;  // Display the message returned by the server
            responseMessage.style.color = response.ok ? "green" : "red";  // Set the text color based on success or failure

            if (response.ok) {
                form.reset();  // Clear the form fields if registration was successful
            }
        } catch (error) {
            // Handle any errors that occurred during the request
            console.error("Error during registration:", error);
            responseMessage.textContent = "An error occurred during registration. Please try again.";  // Display an error message
            responseMessage.style.color = "red";  // Set the message text color to red to indicate failure
        }
    });
});

