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
        clearTimeout(timer);
        if (addedSpan) {
            addedSpan.remove();
            addedSpan = null;
        }
        
        timer = setTimeout(() => {
            addedSpan = document.createElement('span');
            addedSpan.textContent = 'aaa';
            addedSpan.style.color = 'red';
            addedSpan.style.marginLeft = '5px';
            span.after(addedSpan);

            document.addEventListener('click', handleOutsideClick);
        }, 1500); // 1.5 seconds debounce
    }

    // Function to monitor DOM for newly added elements with the target class
    function monitorDOM() {
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

    monitorDOM();
})();
