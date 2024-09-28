async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

async function submitForm() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');

    // Compute SHA-256 hash of the password
    const passwordHash = await sha256(password);

    const data = {
        username: username,
        hash: passwordHash
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch('/auth', requestOptions)
        .then(response => response.json())
        .then(data => {
            // Handle the response here
            if (data.token) {
                document.cookie = `token=${data.token};`;

                // Redirect to the dashboard page
                window.location.href = "/dash";
            } else {
                // Handle the error if needed
                console.error("Authentication failed.");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
        });
}

