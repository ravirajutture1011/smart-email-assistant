console.log("Email Writer Extension - Content Script Loaded");

//Creates the "AI Reply" button
function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

//Extracts latest email content (best effort)
function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

//Find the Gmail compose box toolbar
function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

//Inject the AI button and click logic
function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) return;

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert("Could not extract email content.");
                throw new Error("Empty email content");
            }

            const response = await fetch('http://localhost:5000/api/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed with status: ' + response.status);
            }

            const data = await response.json();
            const generated_text = data?.result;

            if (!generated_text || typeof generated_text !== "string") {
                alert("Error from AI: " + (data?.error || "No result returned"));
                throw new Error("Missing result");
            }

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                composeBox.focus();
                try {
                    document.execCommand('insertText', false, generated_text);
                } catch (e) {
                    composeBox.textContent = generated_text;
                }
            } else {
                console.error('Compose box was not found');
            }

        } catch (error) {
            console.error("Error occurred:", error);
            alert("Failed to get response from AI server. Check console for details.");
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

//MutationObserver to detect compose popup
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') ||
             node.querySelector?.('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500); // Wait for compose box to render
        }
    }
});

//Start observing Gmail's DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});
