(function (){
    /** Ленивая загрузка яндекс карты */
    let mapTarget = document.querySelector('.js-map');
    if (mapTarget) {
        let spinner = document.querySelector('.loader');

        let observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spinner.classList.add('is-active');
                    loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=72fefb6c-2a67-40e4-8066-78f0495d0ff8', () => {
                        ymaps.load(init);
                    });
                    observer.unobserve(map);
                }
            });

        }, {
            threshold: 0.5
        });

        observer.observe(mapTarget);

        function init() {

            let iconSize = window.innerWidth > 1024 ? [60, 60] : [33, 46];
            let map = new ymaps.Map('map', {
                center: [45.020898, 38.988272],
                zoom: 14,
                controls: []
            });


            let myPlacemark = new ymaps.Placemark([45.027089, 39.019319], {
                hintContent: '',
                balloonContent: ''
            }, {
                iconLayout: 'default#image',
                iconImageHref: 'img/placeholder.svg',
                iconImageSize: iconSize,
                iconImageOffset: [-16, -23]
            });
            map.geoObjects
                .add(myPlacemark);

            map.behaviors.disable('scrollZoom');

            spinner.classList.remove('is-active');

        }

        const loadScript = (url, callback) => {
            let script = document.createElement('script');
            script.src = url;
            document.querySelector('head').insertAdjacentElement('beforeend', script);
            script.onload = () => callback();
        };
    }
})()