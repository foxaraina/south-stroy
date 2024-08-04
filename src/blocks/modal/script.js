(function (){
        let scrollPosition = 0;
        let activeModal = null;

        function removeModal(modal) {
            modal.classList.remove('show');
            document.body.classList.remove('lock')
            document.documentElement.classList.remove('md-perspective');
            window.scrollTo({top: scrollPosition});
        }

        function removeModalHandler(modal) {
            removeModal(modal);
        }

        document.querySelectorAll('.modal-trigger').forEach(function (el) {

            const modal = document.querySelector('#' + el.getAttribute('data-modal')),
                  close = modal.querySelector('.modal__close');

            el.addEventListener('click', function () {
                document.querySelector(".mobile-menu").classList.remove("is-open")
                scrollPosition = document.documentElement.scrollTop
                modal.classList.add('show');
                document.body.classList.add('lock')
                activeModal = modal

                if (el.classList.contains('md-setperspective')) {
                    setTimeout(function () {
                        document.documentElement.classList.add('md-perspective');
                    }, 25);
                }
            });

            close.addEventListener('click', function () {
                removeModalHandler(modal);
            });
        });

    document.addEventListener('keyup', (e) => {
        if (e.key === "Escape" && activeModal) {
            removeModalHandler(activeModal);
        }
    });

    window.addEventListener('click', (e) => {
        if(document.querySelector(".modal.show")) {
            e.stopPropagation();
            let containerInner = activeModal && activeModal.querySelector('.modal__inner')
            if (containerInner && !containerInner.contains(e.target) &&
                !e.target.classList.contains('modal-trigger') &&
                !e.target.closest('.modal-trigger')) {
                removeModalHandler(activeModal);
            }
        }
    })

})();