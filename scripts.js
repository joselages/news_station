$(document).ready(function () {
  date.getDate();
  setInterval(function () {
    date.getDate();
  }, 1000);
});

/* https://cors-anywhere.herokuapp.com/ */
/* https://eco.sapo.pt/wp-json/eco/v1/items */

var news = {
  RSS_URL: "http://feeds.jn.pt/JN-Ultimas",
  news: "",
  loaded: false,
  getNews: function () {
    var self = this;

    $(".js-news").empty();
    $(".js-tempNews").css("top", "-33.3%").empty();
    self.news = "";

    $.ajax(self.RSS_URL, {
      accepts: {
        xml: "application/rss+xml",
      },
      dataType: "xml",
      success: function (data) {
        self.news = data;
        //.log(self.news);

        $(self.news)
          .find("item")
          .each(function (idx) {
            const el = $(this);
            var mainTemplate = `
                            <article class="news__article${
                              idx === 0 ? " -first" : ""
                            }">
                                <h2 class="article__title">${el
                                  .find("title")
                                  .text()}</h2>
                                <p class="article__txt">${el
                                  .find("description")
                                  .text()}</p>
                                <small class="article__small">${el
                                  .find("pubDate")
                                  .text()}</small>
                            </article>
                        `;

            var tempTemplate = `
                            <div class="temp-news__container">
                                <h3 class="temp-news__title">${el
                                  .find("title")
                                  .text()}</h3>
                            </div>
                        `;

            mainTemplate = mainTemplate.split(/<img.+alt=""\/>/).join("");

            $(".js-news").append(mainTemplate);
            $(".js-tempNews").append(tempTemplate);
          })
          .promise()
          .done(self.slider());
      },
    });
  },
  slider: function () {
    // var self = this;
    // self.loaded = true;

    goToMainScreen();
    loading.hide();

    var newsLength = $(".js-news").find(".news__article").length;
    var idxAtual = 0;
    var idxNext;

    var interval = setInterval(function () {
      idxNext = idxAtual + 1;
      if (newsLength - 1 === idxAtual) {
        //acabou
        clearInterval(interval);
        loading.show();
        showModalScreen();
        news.getNews();
        return;
      } else {
        //main news
        $(".news__article").eq(idxAtual).css("left", "-100%");
        $(".news__article").eq(idxNext).css("left", "0");

        //
        $(".js-tempNews").css("top", 33.3 * (idxNext + 1) * -1 + "%");
      }
      idxAtual++;
    }, 500);
  },
  init: function () {
    var self = this;

    self.getNews();
  },
};

var temperature = {
  weatherKey: config.WEATHER_API_KEY,
  lat: "",
  long: "",
  init: function () {
    var self = this;
    var weatherApiUrl =
      "https://api.openweathermap.org/data/2.5/weather?lat=" +
      self.lat +
      "&lon=" +
      self.long +
      "&units=metric&appid=" +
      self.weatherKey;

    $.ajax({
      url: weatherApiUrl,
      success: function (result) {
        $(".js-temperature").append(`
                    <p class="temperature__degrees">${parseInt(
                      result.main.temp
                    )}ºC</p>
                    <p class="temperature__city">${result.name}</p>
                `);

        goToMainScreen();
      },
    });
  },
};

var date = {
  days: [
    "Domingo",
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
  ],
  months: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  getDate: function () {
    var self = this;

    var now = new Date();
    var hour = now.getHours();
    var minutes =
      now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
    var dayOfWeek = self.days[now.getDay()];
    var dayOfMonth = now.getDate();
    var monthOfYear = self.months[now.getMonth()];
    var year = now.getFullYear();

    var fullDate = `${dayOfWeek}, ${dayOfMonth} de ${monthOfYear} ${year}`;

    $(".js-time").html(hour + ":" + minutes);
    $(".js-date").html(fullDate);
  },
};

var form = {
  elements: {
    $checkbox: $(".js-locCheck"),
    $formModal: $(".js-formModal"),
    $form: $(".js-startForm"),
    $msgInput: $(".js-msgInput"),
    $displayMessage: $(".js-message"),
    $startScreen: $(".js-overlayScreen"),
    $button: $(".js-formBtn"),
    $errorModal: $(".js-errorModal"),
    $errorMsg: $(".js-errorMsg"),
    $errorBtn: $(".js-errorBtn"),
  },
  data: {
    msg: "",
  },
  successLoc: function (position) {
    temperature.lat = position.coords.latitude;
    temperature.long = position.coords.longitude;
    temperature.init();
  },
  errorLoc: function (error) {
    loading.hide();
    form.elements.$errorMsg.html(error.message);
    console.error(error.message);
    form.elements.$errorModal.removeClass("-hidden");
  },
  init: function () {
    var self = this;

    news.init();
    self.elements.$form.addClass("-hidden");
    loading.show();

    //mensagem
    self.data.msg = self.elements.$msgInput.val().trim();
    if (self.data.msg !== "") {
      self.elements.$displayMessage.html(self.data.msg);
    }

    //localizaçao e temperatura
    var isChecked = self.elements.$checkbox.is(":checked");
    if (isChecked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          self.successLoc,
          self.errorLoc
        );
      } else {
        self.errorLoc({
          error: "O seu browser não suporta a partilha de localização",
        });
      }
    } else {
      goToMainScreen();
    }
  },
};

var loading = {
  $icon: $(".js-loadingIcon"),
  change: function () {
    var self = this;
    self.$icon.toggleClass("-hidden");
  },
  hide:function(){
    var self = this;
    self.$icon.removeClass("-hidden");
  },
  show:function(){
    var self = this;
    self.$icon.addClass("-hidden");
  }
};

function goToMainScreen() {
  $(".js-mainContent").show();
  form.elements.$startScreen.addClass("-hidden");
}

function showModalScreen(){
  $(".js-mainContent").hide();
  form.elements.$startScreen.removeClass("-hidden");
}

form.elements.$form.on("submit", function (e) {
  e.preventDefault();
  form.init();
});

form.elements.$errorBtn.on("click", function () {
  goToMainScreen();
});
