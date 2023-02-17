$(document).ready(function () {
  date.getDate();
  news.init();
  setInterval(function () {
    date.getDate();
  }, 1000);
});


var news = {
  RSS_URL: "https://rr.sapo.pt/rss/rssfeed.aspx?section=section_noticias",
  news: "",
  reload: false,
  getNews: function () {
    var self = this;

    $(".js-news").empty();
    $(".js-tempNews").empty();
    self.news = "";

    fetch(
      self.RSS_URL
    )
      .then(resp => resp.text())
      .then(str => $.parseXML(str))
      .then(xml => xmlToJson(xml))
      .then(data => self.populate(data));
  },
  formatNewsDate(date){
    const dateTxt = date.toLocaleDateString('pt-PT',{
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const hourTxt = date.getHours()+'';
    const minutesTxt = date.getMinutes()+'';

    return hourTxt.padStart(2, '0')+':'+ minutesTxt.padStart(2, '0') + ' ' + dateTxt;
  },
  populate: function (data) {
    var self = this;
    self.news = data.rss.channel.item;

    if (self.reload) {
      setTimeout(function () {
        self.slider();
        goToMainScreen();
      }, 1000);
    }

    self.news.forEach(function (el, idx) {
      if (el !== "") {
        let newsDate = new Date(el.pubDate['#text']);
        var mainTemplate = `
        <article class="news__article" style="left:${100 * idx}%">
            <h2 class="article__title">${el.title['#text']}</h2>
            <p class="article__txt">${el.description['#text'] ?? ''}</p>
            <div class="article__details">
            <small class="article__small">${self.formatNewsDate(newsDate)}</small>
            <a class="article__link" href="${el.link['#text']}" target="_blank">Ler na RR</a>
            </div>
        </article>`;

        var tempTemplate = `
        <div class="temp-news__container">
            <h3 class="temp-news__title">${el.title['#text']}</h3>
        </div>`;

        mainTemplate = $.parseHTML(mainTemplate);
        $(mainTemplate).find("img").remove();

        $(".js-news").append(mainTemplate);
        $(".js-tempNews").append(tempTemplate);
      }
    });
  },
  scroll: function () {
    $(".js-news").addClass("-scrollable");
  },
  // sliderConfig: {
  //   autoplay: true,
  //   autoplaySpeed: 15000,
  //   arrows: false,
  //   useTransform: false,
  //   draggable: false,
  //   focusOnSelect: false,
  //   infinite: false,
  //   swipeToSlide: true,
  // },
  slider: function () {
    var self = this;

    if (form.data.userWants === "slider") {
      self.sliderAuto();
      return;
    }
  },
  sliderAuto: function () {
    var self = this;
    var newsLength = $(".js-news").find(".news__article").length;
    var idxAtual = 0;
    var idxNext = 0;

    var interval = setInterval(function () {
      idxNext = idxAtual + 1;

      if (newsLength - 1 === idxAtual) {
        self.reload = true;

        loading.show();
        showModalScreen();
        $(".js-news").css("transform", "translateX(0%)");
        $(".js-tempNews").css("transform", "translateY(" + -100 / 3 + "%)");
        news.getNews();
        clearInterval(interval);
        return;
      } else {
        //main news
        //$(".news__article").eq(idxAtual).css("left", "-100%");
        $(".js-news").css("transform", "translateX(" + -100 * idxNext + "%)");
        $(".js-tempNews").css(
          "transform",
          "translateY(" + (-100 / 3) * (idxNext + 1) + "%)"
        );
      }
      idxAtual++;
    }, form.data.seconds);
  },
  init: function () {
    var self = this;
    self.getNews();
  },
};

var temperature = {
  weatherKey: WEATHER_API_KEY,
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
        if (form.error === false) {
          news.slider();
          goToMainScreen();
        }
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

    var fullDate = `${dayOfWeek},<br> ${dayOfMonth} de ${monthOfYear} ${year}`;

    $(".js-time").html(hour + ":" + minutes);
    $(".js-date").html(fullDate);
  },
};

var form = {
  elements: {
    $welcomeMsg: $('.js-welcomeMsg'),
    $welcomeBtn:$('.js-letsStart'),
    $checkbox: $(".js-locCheck"),
    $formModal: $(".js-formModal"),
    $form: $(".js-startForm"),
    $msgInput: $(".js-msgInput"),
    $displayMessage: $(".js-message"),
    $startScreen: $(".js-overlayScreen"),
    $button: $(".js-formBtn"),
    $errorModal: $(".js-errorModal"),
    $errorMain: $(".js-errorMain"),
    $errorConclusion: $(".js-errorConclusion"),
    $errorBtn: $(".js-errorBtn"),
    $fakeRadioBtn: $(".js-fakeRadioBtn"),
    $realRadioBtn: $(".js-radioBtn"),
    $secondsSentence: $(".js-secondsLabel"),
    $secondsInput: $(".js-secondsInput"),
  },
  data: {
    msg: "",
    userWants: "",
    seconds: 15000,
  },
  error: false,
  successLoc: function (position) {
    temperature.lat = position.coords.latitude;
    temperature.long = position.coords.longitude;
    temperature.init();
  },
  showError: function (error) {
    form.error = true;
    loading.hide();
    form.elements.$errorMain.html(error.message);

    if (error.conclusion) {
      form.elements.$errorConclusion.html(error.conclusion);
    } else {
      form.elements.$errorConclusion.html(
        "A temperatura e localização não serão mostradas."
      );
    }

    console.error(error.message);
    form.elements.$errorModal.removeClass("-hidden");
  },
  init: function () {
    var self = this;

    self.elements.$formModal.addClass("-hidden");
    loading.show();

    //mensagem
    self.data.msg = self.elements.$msgInput.val().trim();
    if (self.data.msg !== "") {
      self.elements.$displayMessage.html(self.data.msg);
    }

    //tipo de slider
    self.data.userWants = form.elements.$realRadioBtn.filter(":checked").val();

    if (self.data.userWants === "slider") {
      let twoNumbersRegex = /^[0-9]{1,2}$/;
      let inputedSeconds = self.elements.$secondsInput.val();
      if (twoNumbersRegex.test(inputedSeconds)) {
        inputedSeconds = parseInt(inputedSeconds);
        if (inputedSeconds > 0 && inputedSeconds < 120) {
          self.data.seconds = inputedSeconds * 1000;
        } else {
          self.showError({
            message: "Valor inválido.",
            conclusion: "O valor por defeito é de 15 segundos.",
          });
        }
      } else {
        self.showError({
          message: "Valor inválido.",
          conclusion: "O valor por defeito é de 15 segundos.",
        });
      }
    } else {
      $(".js-news").parent().addClass("-scrollable");
      $(".js-tempNews").addClass("-scrollable");
    }

    //localizaçao e temperatura
    var isChecked = self.elements.$checkbox.is(":checked");

    if (isChecked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          self.successLoc,
          self.showError
        );
      } else {
        self.showError({
          message: "O seu browser não suporta a partilha de localização",
        });
      }
    } else {
      if (self.error === false) {
        news.slider();
        goToMainScreen();
      }
    }
    
    //se nao tiver checked e nao tiver mensagem
    if(!isChecked && !self.data.msg){
      $(".js-news").parent().addClass("-full_height");
    }
  },
};

form.elements.$form.on("submit", function (e) {
  e.preventDefault();
  form.init();
});

form.elements.$errorBtn.on("click", function () {
  form.error = false;
  news.slider();
  goToMainScreen();
});

form.elements.$fakeRadioBtn.on("change", function () {
  $(this).addClass("-checked");
  form.elements.$fakeRadioBtn.not($(this)).removeClass("-checked");

  if ($(this).find(form.elements.$realRadioBtn).attr("value") === "slider") {
    form.elements.$secondsSentence.removeClass("-inactive");
    form.elements.$secondsInput.prop("disabled", false);
  } else {
    form.elements.$secondsSentence.addClass("-inactive");
    form.elements.$secondsInput.prop("disabled", true);
  }
});

form.elements.$realRadioBtn.on("focus", function () {
  if (whatInput.ask() === "keyboard") {
    $(this).parent().addClass("-focused");
    //form.elements.$realRadioBtn.not($(this)).parent().removeClass("-focused");
  }
});

form.elements.$realRadioBtn.on("focusout", function () {
  $(this).parent().removeClass("-focused");
});

var loading = {
  $icon: $(".js-loadingIcon"),
  change: function () {
    var self = this;
    self.$icon.toggleClass("-hidden");
  },
  hide: function () {
    var self = this;
    self.$icon.addClass("-hidden");
  },
  show: function () {
    var self = this;
    self.$icon.removeClass("-hidden");
  },
};

function goToMainScreen() {
  $(".js-mainContent").show();
  form.elements.$startScreen.addClass("-hidden");
}

function showModalScreen() {
  $(".js-mainContent").hide();
  form.elements.$startScreen.removeClass("-hidden");
}

form.elements.$welcomeBtn.on("click", () => {
  form.elements.$welcomeMsg.addClass('-hidden');
  form.elements.$form.removeClass('-hidden');
});
