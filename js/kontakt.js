 const form = document.querySelector('form');
                const formResponse = document.getElementById('form-response');

                form.addEventListener('submit', function(event) {
                    event.preventDefault();

                    const formData = new FormData(form);

                    fetch(form.action, {
                        method: form.method,
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(response => {
                        if (response.ok) {
                            formResponse.classList.add('show');
                            form.reset();
                            setTimeout(() => {
                                formResponse.classList.remove('show');
                            }, 5000);
                        } else {
                            response.json().then(data => {
                                if (Object.hasOwn(data, 'errors')) {
                                    alert(data["errors"].map(error => error["message"]).join(", "));
                                } else {
                                    alert("Došlo je do greške prilikom slanja poruke.");
                                }
                            });
                        }
                    }).catch(error => {
                        alert("Došlo je do greške prilikom slanja poruke.");
                    });
                });