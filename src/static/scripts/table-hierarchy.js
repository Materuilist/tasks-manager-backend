const parentRowsTogglers = document.querySelectorAll(
    "tr[parent] img.toggler-icon"
);
parentRowsTogglers.forEach((parentRowToggler) =>
    parentRowToggler.addEventListener("click", ({ target }) => {
        target.classList.toggle("open");

        const parentRowId = target
            .closest("tr[parent")
            .getAttribute("parent-id");

        const childrenRows = document.querySelectorAll(
            `tr[parent-id="${parentRowId}"]:not([parent])`
        );
        childrenRows.forEach((childRow) =>
            childRow.setAttribute(
                "hidden",
                childRow.getAttribute("hidden") === "false" ? "true" : "false"
            )
        );
    })
);
