exports.TabView = TabView;

function TabView(el) {
  el = this.el = el || document.createElement("div");
  el.classList.add("tabview");
  this.tabs = [];
  this.selected = null;
  this.width = null;
  this.height = null;
  this.tabExtraWidths = 0;
  this.customTabWidths = 0;
}

function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

TabView.prototype.resize = function (width, height) {

  if (arguments.length === 0) {
    if (!isNumber(this.width) || !isNumber(this.height)) {
      return;
    }
    width = this.width;
    height = this.height;
  }
  else {
    if (!isNumber(width) || !isNumber(height)) {
      throw new TypeError("width and height must be numbers");
    }
    this.width = width;
    this.height = height;
  }

  this.el.style.width = width + "px";
  this.el.style.height = height + "px";

  var i, l = this.tabs.length;

  var space = (width + 14) - l * (this.tabExtraWidths + this.customTabWidths);
  var lineHeight = (height - 3) + "px";
  for (i = 0; i < l; i++) {
    var maxWidth = Math.round(space / (l - i));
    space -= maxWidth;
    this.tabs[i].label.el.style.width = Math.min(maxWidth, 104) + "px";
    this.tabs[i].el.style.lineHeight = lineHeight;
    this.tabs[i].el.style.height = lineHeight;
  }

};

// Content is a cell
// tab is any object that fits the Tab interface
// .el, the root element
// .activate() for when the tab is selected
// .deactivate() for when the tab is deselected
// .close() for when the tab is being closed. Return a truthy value to cancel.
TabView.prototype.add = function (label) {
  var self = this;
  var tab = { label: label };
  label.select = function () {
    self.select(tab);
  };
  label.deselect = function () {
    self.desekect(tab);
  };
  label.remove = function () {
    self.remove(tab);
  };
  this.tabs.push(tab);
  tab.el = document.createElement('div');
  this.el.appendChild(tab.el);
  tab.el.appendChild(label.el);
  var closeButton = document.createElement('a');
  var closeIcon = document.createElement('i');
  closeButton.appendChild(closeIcon);
  closeIcon.className = "icon-remove";
  tab.el.appendChild(closeButton);

  // Calculate extra widths
  this.tabExtraWidths = 0;
  var tabComputedStyle = window.getComputedStyle(tab.el, null);
  //tabExtraWidths += leftSwoop.scrollWidth;
  //tabExtraWidths += rightSwoop.scrollWidth;
  this.tabExtraWidths += closeButton.scrollWidth;
  this.tabExtraWidths += parseInt(tabComputedStyle.getPropertyValue('padding-left'), 10);
  this.tabExtraWidths += parseInt(tabComputedStyle.getPropertyValue('padding-right'), 10);
  this.tabExtraWidths += parseInt(tabComputedStyle.getPropertyValue('margin-left'), 10);
  this.tabExtraWidths += parseInt(tabComputedStyle.getPropertyValue('margin-right'), 10);

  tab.el.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (self.selected === tab) {
      self.deselect(tab);
    }
    else {
      self.select(tab);
    }
  }, false);
  closeButton.addEventListener("click", function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    self.remove(tab);
  }, true);


  this.resize();
};

TabView.prototype.deselect = function (tab) {
  if (this.selected === tab) {
    tab.label.deactivate();
    tab.el.classList.remove("selected");
    this.selected = null;
  }
};

TabView.prototype.select = function (tab) {
  if (this.selected) {
    this.deselect(this.selected);
  }
  tab.label.activate();
  tab.el.classList.add("selected");
  this.selected = tab;
};

TabView.prototype.getSelectedIndex = function() {
  if (!this.selected)
    return -1;
  for (var i = 0, len = this.tabs.length; i < len; i++) {
    if (this.tabs[i].el.classList.contains("selected") === true)
      return i;
  }
  return -1;
};

TabView.prototype.getExtraWidths = function() {
  return this.tabExtraWidths;
};

TabView.prototype.addCustomExtraWidths = function(width) {
  this.customTabWidths += width;
};

TabView.prototype.remove = function (tab) {
  if (!tab.label.close()) {
    var index = this.tabs.indexOf(tab);
    if (tab === this.selected) {
      this.deselect(tab);
      var next = this.tabs[index + 1] || this.tabs[index - 1];
      if (next) {
        this.select(next);
      }
    }
    this.tabs.splice(index, 1);
    this.el.removeChild(tab.el);
    this.resize();
  }
};
