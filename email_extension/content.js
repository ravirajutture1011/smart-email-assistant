console.log("Email Writer Extension - Content Script Loaded");

// Create AI button with tone selection
function createAIButton() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    wrapper.classList.add('ai-reply-wrapper');

    // Tone dropdown

    const toneSelect = document.createElement('select');
    toneSelect.innerHTML = `
        <option value="professional">Professional</option>
        <option value="casual">Casual</option>
        <option value="friendly">Friendly</option>
        <option value="concise">Concise</option>
        <option value="apologetic">Apologetic</option>
    `;
    toneSelect.className = 'ai-tone-select';
    toneSelect.style.padding = '4px';
    toneSelect.style.fontSize = '12px';

    // AI Reply button
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    button.style.padding = '8px 16px';
    button.style.backgroundColor = '#1a73e8';
    button.style.color = '#ffffff';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

    // Click logic
    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.6';

            const emailContent = getEmailContent();
            const selectedTone = toneSelect.value;

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
                    tone: selectedTone
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
                // Clear previous content
                composeBox.innerHTML = "";
                try {
                    document.execCommand("insertText", false, generated_text);
                } catch (e) {
                    composeBox.innerText = generated_text;
                }
            } else {
                console.error('Compose box was not found');
            }

        } catch (error) {
            console.error("Error occurred:", error);
            alert("Failed to get response from AI server. Check console for details.");
        } finally {
            button.innerHTML = 'AI Reply';
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        }
    });

    // Append dropdown and button
    wrapper.appendChild(toneSelect);
    wrapper.appendChild(button);
    return wrapper;
}

// Extracts latest visible email content
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

// Find Gmail's compose toolbar
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

// Inject AI button only once
function injectButton() {
    const existing = document.querySelector('.ai-reply-wrapper');
    if (existing) return;

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    const wrapper = createAIButton();
    toolbar.insertBefore(wrapper, toolbar.firstChild);
}

// Watch for compose popup open
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasCompose = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.('.aDh, .btC, [role="dialog"]') ||
             node.querySelector?.('.aDh, .btC, [role="dialog"]'))
        );

        if (hasCompose) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500); // wait for toolbar to load
        }
    }
});

// Start observing Gmail DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});
