console.log('浏览器扩展加载🐒');

(function() {
    'use strict';
    console.log('浏览器扩展 IIFE 中🐒');

    let timer;
    let addedSpan;

    // Function to observe changes in a given span element
    function observeSpan(span) {
        const observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type === 'characterData') {
                    handleTextChange(span);
                }
            }
        });

        observer.observe(span, { characterData: true, subtree: true });
    }

    // Handle text changes in the target span
    function handleTextChange(span) {
        console.log('文本变化中......', span.textContent);
        clearTimeout(timer);
        if (addedSpan) {
            addedSpan.remove();
            addedSpan = null;
        }
        
        timer = setTimeout(() => {
            fetchContent(span.textContent)
                .then(content => {
                    if (addedSpan) {
                        addedSpan.remove();
                        addedSpan = null;
                    }
                    addedSpan = document.createElement('span');
                    addedSpan.textContent = content;
                    addedSpan.style.color = 'gray';
                    addedSpan.style.marginLeft = '5px';
                    span.after(addedSpan);

                    document.addEventListener('click', handleOutsideClick);
                    document.addEventListener('keydown', handleTabPress);
                })
                .catch(err => console.error('Error fetching content:', err));
        }, 1500); // 1.5 seconds debounce
    }

    // Function to fetch content from the API
    async function fetchContent(spanText) {
        console.log('请求数据中......', spanText)
        const response = await fetch('http://localhost:8766/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": "我正在写作，你没有自我意识，只是一个自动补全助手。请根据我发给你的信息，补全后面的部分，不要超过 10 个字。注意只给出后面的话，不要重复之前的话。"
                    },
                    {
                        "role": "user",
                        "content": `${spanText}`
                    }
                ],
                "model": "gpt-3.5"
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Function to monitor DOM for newly added elements with the target class
    function monitorDOM() {
        console.log('监控 DOM 中......🐒');
        
        const targetClass = 'author-6891085647944171522'; // Modify this to match the desired class
        const targetElements = document.querySelectorAll(`.${targetClass}`);

        targetElements.forEach(span => {
            observeSpan(span);
        });

        // Observe the entire document for newly added elements
        const bodyObserver = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const newSpans = node.querySelectorAll(`.${targetClass}`);
                            newSpans.forEach(span => {
                                observeSpan(span);
                            });
                        }
                    });
                }
            }
        });

        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Handle outside click to remove the added span
    function handleOutsideClick(event) {
        if (addedSpan && !addedSpan.contains(event.target)) {
            addedSpan.remove();
            addedSpan = null;
            document.removeEventListener('click', handleOutsideClick);
        }
    }

    // Handle Tab key press to adopt the suggestion
    function handleTabPress(event) {
        if (event.key === 'Tab' && addedSpan) {
            const targetSpan = addedSpan.previousSibling;
            targetSpan.textContent += addedSpan.textContent;
            addedSpan.remove();
            addedSpan = null;
            event.preventDefault();
          document.removeEventListener('keydown', handleTabPress);
          //阻止事件冒泡
          event.stopPropagation();
        }
    }

    // Re-run monitorDOM on each Enter key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            monitorDOM();
        }
    });

    monitorDOM();
})();
