import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Fancybox } from "@fancyapps/ui";
import IMask from 'imask';
import 'lazysizes';
import '../blocks/map/script';
import '../blocks/modal/script';

function sliderCounter(el, elLength, currentIndex) {
    let counter = el.parentElement.querySelector(".swiper-counter")
    counter.innerHTML = `<span class="swiper-counter__current">${currentIndex + 1}</span> / <span class="swiper-counter__total">${elLength}</span>`;
}

const portfoliSliders = document.querySelectorAll('.js-portfolio-slider');

portfoliSliders.forEach(slider => {
     new Swiper(slider, {
        modules: [Navigation, Pagination],
        loop: true,
        lazy: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: slider.parentElement.querySelector(".swiper-button-next"),
            prevEl: slider.parentElement.querySelector(".swiper-button-prev"),
        },
        on: {
            afterInit: function ({el, slides, realIndex}) {
                sliderCounter(el, slides.length, realIndex)
            },
            activeIndexChange: function ({el, slides, realIndex}) {
                sliderCounter(el, slides.length, realIndex)
            }
        }
    });
})

function quiz() {
    const quiz = document.querySelector('.quiz')
    const nextQuestionBtn = quiz.querySelector('.js-next-question')
    const prevQuestionBtn = quiz.querySelector('.js-prev-question')
    const submitQuizBtn = quiz.querySelector('.js-submit-quiz')
    let activeQuestionIndex = 1
    let activeQuestion = quiz.querySelector(`#question-${activeQuestionIndex}`)
    const currentStep = quiz.querySelector(".js-current-step")
    const questionsLength = quiz.querySelectorAll(".quiz__question").length
    const progressbar = quiz.querySelector(".js-progressbar")
    prevQuestionBtn.disabled = activeQuestionIndex === 1

    nextQuestionBtn.addEventListener('click', () => {
            goToNextQuestion()
    });
    prevQuestionBtn.addEventListener('click', () => {
        goToPrevQuestion()
    });

    quiz.addEventListener("change", (event) => {
        if(event.target.classList.contains("js-quiz-control")) {
            goToNextQuestion()
        }
    })

    function goToNextQuestion() {
        changeQuestion(activeQuestionIndex, "next")
    }

    function goToPrevQuestion() {
        changeQuestion(activeQuestionIndex, "prev")
    }

    function changeQuestion(index, direction) {
        activeQuestion.classList.remove("active")
        activeQuestionIndex=  direction === "next" ? activeQuestionIndex + 1 : activeQuestionIndex - 1
        activeQuestion = quiz.querySelector(`#question-${activeQuestionIndex}`)
        activeQuestion.classList.add("active")
        currentStep.innerText = activeQuestionIndex
        progressbar.style.width = (100/questionsLength)*(activeQuestionIndex - 1) + "%"
        switch (activeQuestionIndex) {
            case 1: {
                prevQuestionBtn.disabled = true
                nextQuestionBtn.style.display = "inline-flex"
                submitQuizBtn.style.display = "none"
                break;
            }
            case questionsLength: {
                prevQuestionBtn.disabled = false
                nextQuestionBtn.style.display = "none"
                submitQuizBtn.style.display = "inline-flex"
                break;
            }
            default: {
                prevQuestionBtn.disabled = false
                nextQuestionBtn.style.display = "inline-flex"
                submitQuizBtn.style.display = "none"
            }
        }
    }
}

quiz()


// Слайдер команды
const teamSlider = document.querySelector('.js-team-slider');
if (teamSlider) {
    new Swiper(teamSlider, {
        modules: [Navigation, Pagination],
        lazy: true,
        loop: true,
        navigation: {
            nextEl: teamSlider.querySelector(".swiper-button-next"),
            prevEl: teamSlider.querySelector(".swiper-button-prev"),
        },
        slidesPerView: 1,
        spaceBetween: 23,
        breakpoints: {
            570: {
                slidesPerView: 2,
            },
            768: {
                slidesPerView: 3,
            },
            1024: {
                slidesPerView: 4,
            }
        }
    });
}

const mobileMenuButton = document.querySelector(".header__menu")
const closeMobileButton = document.querySelector(".mobile-menu__close")
mobileMenuButton.addEventListener("click", () => {
    document.querySelector(".mobile-menu").classList.add("is-open")
})
closeMobileButton.addEventListener("click", () => {
    document.querySelector(".mobile-menu").classList.remove("is-open");
})

// Маска телефона
function initMasks(element) {
    new IMask(element, {
        mask: '+7 (000)000-00-00',
        lazy: true,  // make placeholder always visible
        placeholderChar: '_'     // defaults to '_'
    });
}

const phoneInputs = document.querySelectorAll('input[type="tel"]');
phoneInputs.forEach(item => {
    initMasks(item);
});

const testimonialsBlock = document.querySelector('.js-testimonials-slider')
const testimonialSlider = new Swiper(testimonialsBlock, {
    modules: [Navigation, Pagination],
    lazy: true,
    loop: true,
    navigation: {
        nextEl: testimonialsBlock.querySelector(".swiper-button-next"),
        prevEl: testimonialsBlock.querySelector(".swiper-button-prev"),
    },
    on: {
        afterInit: function ({el, slides, realIndex}) {
            sliderCounter(el, slides.length, realIndex)
        },
        activeIndexChange: function ({el, slides, realIndex}) {
            sliderCounter(el, slides.length, realIndex)
        }
    }
});

const showMoreTestimonialsButton = document.querySelector(".js-show-more-testimonials")

function showMoreTestimonials(testimonialsNodes = testimonialSlider.slides, step = 3) {
    let count = 0;
    testimonialSlider.slides.forEach(slide => {
        if(!slide.checkVisibility() && count < step) {
            slide.style.display = 'flex'
            slide.style.opacity = "0"
            setTimeout(() => {
                slide.style.opacity = "1"
            }, 0)
            count++;
        }
    })
}
showMoreTestimonialsButton.addEventListener('click', showMoreTestimonials)
const resizeObserver = new ResizeObserver(throttle((entries) => {
    for(let entry of entries) {
        const width = entry.contentBoxSize[0].inlineSize
        if (width < 640) {
            testimonialSlider.slideTo(0)
            testimonialSlider.disable()
        } else {
            testimonialSlider.enable()
        }


        // логика
    }
}, 300))
resizeObserver.observe(document.body)
function throttle(func, ms) {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}

Fancybox.bind("[data-fancybox]", {
    // Custom options for all galleries
});

const formEl = document.querySelectorAll(".js-form")
formEl.forEach(form => {
    form.addEventListener("submit", (event) => {
        event.preventDefault()
        const data = new FormData(form);
        fetch(form.action, {
            method: "POST",
            body: data,
        }).then((result) => {
            console.log(result)
        })
            .catch(err => {
                console.log(err)

            })
    })
})

function scroll_cb() {
    const addClassOnScroll = function () {
        const windowTop = window.scrollY;
        document.querySelectorAll("section[id]").forEach((elem) => {
                const offsetTop = elem.offsetTop
                const outerHeight = elem.getBoundingClientRect().height

                if (windowTop > offsetTop - 90 && windowTop < offsetTop + outerHeight) {
                    const elemId = elem.id;
                    if(document.querySelector('.js-anchor.active')) {
                        document.querySelector('.js-anchor.active').classList.remove('active')
                    }
                    document.querySelector(`a[href="#${elemId}"]`).classList.add('active')
                }
        })
    };
    addClassOnScroll();
}


document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("scroll", throttle(scroll_cb, 300));
    document.querySelectorAll(".js-anchor").forEach(el => {
        el.addEventListener("click", (event) => {
            event.preventDefault();
            document.querySelector(".mobile-menu").classList.remove("is-open");
            document.querySelector(el.getAttribute("href")).scrollIntoView({ behavior: "smooth", block: 'start' })

            if(document.querySelector('.js-anchor.active')) {
                document.querySelector('.js-anchor.active').classList.remove('active')
            }
            el.classList.add("current")
        })
    })
})

