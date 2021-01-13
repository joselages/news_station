$(document).ready(function () {
    news.init();
    temperature.init();

    setInterval(function () {
        date.getDate();
    }, 500);
});

/*https://cors-anywhere.herokuapp.com/*/
/* https://eco.sapo.pt/wp-json/eco/v1/items */

var news = {
    RSS_URL: "http://feeds.jn.pt/JN-Ultimas",
    news: '',
    getNews: function () {
        var self = this;

        $.ajax(self.RSS_URL, {
            accepts: {
                xml: "application/rss+xml"
            },
            dataType: "xml",
            success: function (data) {
                self.news = data;
                console.log(self.news);
                $(self.news)
                    .find("item")
                    .each(function (idx) {
                        const el = $(this);
                        var mainTemplate = `
                            <article class="news__article${idx === 0 ? " -first" : ""}">
                                <h2 class="article__title">${el.find("title").text()}</h2>
                                <p class="article__txt">${el.find("description").text()}</p>
                                <small class="article__small">${el.find("pubDate").text()}</small>
                            </article>
                        `;

                        var tempTemplate = `
                            <div class="temp-news__container">
                                <h3 class="temp-news__title">${el.find("title").text()}</h3>
                            </div>
                        `;

                        mainTemplate = mainTemplate.split(/<img.+alt=""\/>/).join('');

                        $('.js-news').append(mainTemplate);
                        $('.js-tempNews').append(tempTemplate);
                    }).promise().done(self.slider());
            }
        });
    },
    slider: function () {
        var newsLength = $('.js-news').find('.news__article').length;
        var idxAtual = 0;
        var idxNext;

        var interval = setInterval(function () {
            idxNext = idxAtual + 1;
            if (newsLength - 1 === idxAtual) {
                console.log('acabou');
                clearInterval(interval);
                return;
            } else {
                //main news
                $('.news__article').eq(idxAtual).css('left', '-100%');
                $('.news__article').eq(idxNext).css('left', '0');

                //
                $('.js-tempNews').css('top', (33.3 * (idxNext + 1)) * -1 + '%')
            }
            idxAtual++
        }, 25000);
    },
    init: function () {
        var self = this;

        self.getNews();
    }
}

var temperature = {
    weatherKey: config.WEATHER_API_KEY,
    lat: "40.328435310088416",
    long: "-7.687340898623358",
    init: function () {
        var self = this;
        var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + self.lat + "&lon=" + self.long + "&units=metric&appid=" + self.weatherKey;

        $.ajax({
            url: weatherApiUrl, success: function (result) {

                $('.js-temperature').append(`
                    <p class="temperature__degrees">${parseInt(result.main.temp)}ºC</p>
                    <p class="temperature__city">${result.name}</p>
                `);
            }
        });
    }

}

var date = {
    days: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    getDate: function () {
        var self = this;

        var now = new Date();
        var hour = now.getHours();
        var minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
        var dayOfWeek = self.days[now.getDay()];
        var dayOfMonth = now.getDate();
        var monthOfYear = self.months[now.getMonth()];
        var year = now.getFullYear();

        var fullDate = `${dayOfWeek}, ${dayOfMonth} de ${monthOfYear} ${year}`;

        $('.js-time').html(hour + ':' + minutes);
        $('.js-date').html(fullDate);
    },
}
