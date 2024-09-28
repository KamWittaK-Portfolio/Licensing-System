document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.getElementById("tableBody");

  function createTableRows(data) {
    let rows = "";
    data.forEach((item) => {
      rows += `<tr>
                <td>${item.Name}</td>
                <td>${item.Product}</td>
                <td>${item.Licence}</td>
                <td>${item.IP}</td>
                <td>${item.Creation_Date}</td>
                <td>${item.Duration}</td>
                <td>
                  <div class="rem-buttons">
                    <!-- Remove button -->
                    <button type="button" class="remove-button" data-json='${JSON.stringify(item)}'>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                      </svg>
                    </button>

                    <!-- Refresh button -->
                    <button type="button" class="remove-ip-button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 1 1 .908-.418A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 1z"/>
                      </svg>
                    </button>
                  </div>
                </td>

              </tr>`;
    });
    return rows;
  }

  function sendPostRequest(data) {
    fetch("http://localhost:5001/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        location.reload();
      })
      .catch((error) => {
        console.error("Error sending POST request:", error);
        location.reload();
      });
  }

  function sendRemovePostRequest(data) {
        fetch("http://localhost:5001/remove_ip", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((result) => {
                location.reload();
            })
            .catch((error) => {
                console.error("Error sending POST request:", error);
                location.reload();
            });
    }

  function attachButtonListeners() {
    const removeButtons = document.getElementsByClassName("remove-button");
    for (let i = 0; i < removeButtons.length; i++) {
      removeButtons[i].addEventListener("click", function () {
        const rowData = removeButtons[i].getAttribute("data-json");
        const parsedData = JSON.parse(rowData);
        sendPostRequest(parsedData);
      });
    }

      const removeIPButtons = document.getElementsByClassName("remove-ip-button");
      for (let i = 0; i < removeIPButtons.length; i++) {
          removeIPButtons[i].addEventListener("click", function () {
              const rowData = removeButtons[i].getAttribute("data-json");
              const parsedData = JSON.parse(rowData);
              sendRemovePostRequest(parsedData);
          });
      }
  }

  function fetchTableData() {
    fetch("http://localhost:5001/show")
      .then((response) => response.json())
      .then((data) => {
        const tableRows = createTableRows(data.Licences);
        tableBody.innerHTML = tableRows;
        attachButtonListeners();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  fetchTableData();
});

async function addlic() {
  let name = null;
  let product = null;
  let duration = null;

  while (name === null || name.trim() === "") {
      name = window.prompt("Enter Client's name:");
  }

  while (product === null || product.trim() === "") {
      product = window.prompt("Enter the product:");
  }

  while (duration === null || duration.trim() === "") {
      duration = window.prompt("Enter the duration in days:");
  }

  const data = {
      name: name,
      product: product,
      duration: duration
  };

  try {
      const response = await fetch('http://localhost:5001/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });

      if (response.ok) {
          alert('Licence Created Successfully');
          location.reload();
      } else {
          alert('Failed to create licence. Please try again later.');
          location.reload();
      }
  } catch (error) {
      alert('An error occurred while processing the request. Please try again later.');
      console.error(error);
  }
}
