const DatePicker = (function DatePicker() {
  var _callback = function() {};
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var month = today.getMonth();
  var year = today.getFullYear();
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  function forge(tag, className, contents) {
    var el = document.createElement(tag || "div");
    el.className = className || "";
    el.innerHTML = contents || "";
    return el;
  }

  var popup, container, leftBtn, rightBtn, monthContainer;

  function show() {
    popup.className = popup.className.replace(" hidden", "");
  }
  function hide() {
    popup.className += " hidden";
  }

  function setup() {
    popup = forge("div", "date-picker hidden");
    container = forge("div", "date-picker-container");
    leftBtn = forge("button", "date-picker-btn", "&lsaquo;");
    rightBtn = forge("button", "date-picker-btn", "&rsaquo;");
    closeBtn = forge("button", "date-picker-btn date-picker-close", "&times;");
    monthContainer = forge("div", "date-picker-month-container");
    container.appendChild(leftBtn);
    container.appendChild(monthContainer);
    container.appendChild(rightBtn);
    container.appendChild(closeBtn);
    popup.appendChild(container);
    document.body.appendChild(popup);

    leftBtn.setAttribute("disabled", true);
    leftBtn.addEventListener(
      "click",
      function cycleLeft() {
        month -= 2;
        if (month < 0) {
          month += 12;
          year -= 1;
        }
        if (year === today.getFullYear() && month <= today.getMonth()) {
          month = today.getMonth();
          leftBtn.setAttribute("disabled", true);
        }
        render();
      },
      { passive: true }
    );
    rightBtn.addEventListener(
      "click",
      function cycleRight() {
        month += 2;
        if (month >= 12) {
          month -= 12;
          year += 1;
        }
        leftBtn.removeAttribute("disabled");
        render();
      },
      { passive: true }
    );
    closeBtn.addEventListener("click", hide, { passive: true });
  }

  function monthLength(month, year) {
    if (month === 1) {
      return year % 4 === 0 ? 29 : 28;
    }
    return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  }

  function makeMonth(month, year) {
    if (month >= 12) {
      month -= 12;
      year += 1;
    }
    var weekday = new Date(year, month, 1).getDay();
    var html =
      '<div class="date-picker-month"><h3 class="date-picker-month-title">' +
      monthNames[month] +
      " " +
      year +
      "</h3><table><tr>";
    if (weekday > 0) {
      html += '<td colspan="' + weekday + '">&nbsp;</td>';
    }
    for (var day = 1; day <= monthLength(month, year); day++) {
      var date = new Date(year, month, day);
      var special = date < today ? " date-picker-past" : " ";
      var aria = date < today ? ' aria-hidden="true"' : "";
      if (date.getTime() === today.getTime()) {
        special += " date-picker-today";
      }
      html +=
        '<td class="date-picker-cell"><a href="#" class="date-picker-day' +
        special +
        '" data-date="' +
        date +
        '"' +
        aria +
        ">" +
        day +
        "</a></td>";
      weekday += 1;
      if (weekday % 7 === 0) {
        weekday = 0;
        html += "</tr><tr>";
      }
    }
    return html + "</tr></table></div>";
  }

  function render() {
    monthContainer.innerHTML =
      makeMonth(month, year) + makeMonth(month + 1, year);
    monthContainer.querySelectorAll(".date-picker-day").forEach(function(day) {
      if (day.className.indexOf("date-picker-past") > -1) {
        day.addEventListener(
          "click",
          function(event) {
            event.preventDefault();
          },
          false
        );
      } else {
        day.addEventListener(
          "click",
          function(event) {
            event.preventDefault();
            _callback(new Date(day.dataset.date));
            hide();
          },
          false
        );
      }
    });
  }

  return function(targetEl, callback, alignRight) {
    if (typeof popup === "undefined") {
      setup();
      render();
    }
    function display() {
      // Reset
      if (month !== today.getMonth() || year !== today.getFullYear()) {
        month = today.getMonth();
        year = today.getFullYear();
        render();
      }
      // Save callback
      _callback =
        typeof callback === "undefined"
          ? function(date) {
              targetEl.value = date;
            }
          : callback;
      // Position
      var box = targetEl.getBoundingClientRect();
      popup.style.top = box.bottom + window.scrollY + "px";
      if (alignRight) {
        popup.style.right = document.body.clientWidth - box.right + "px";
      } else {
        popup.style.left = box.left + "px";
      }
      show();
    }
    targetEl.removeEventListener("click", display);
    targetEl.addEventListener("click", display, { passive: true });
  };
})();
