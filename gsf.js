let GSF = {};

GSF.Stages = {};
GSF.Stages.CREATE_PR_STAGE = '#sync-fork-pr-stage';
GSF.Location = '';
GSF.Messages = {};
GSF.LoopTime = 10; // in ms.
GSF.Messages.PR_TITLE = '[GSF] Syncing Fork';
GSF.Messages.PR_BODY = 'This PR was automatically created using ' +
  '[Sync Fork Chrome Extension]' +
  '(https://chrome.google.com/webstore/detail/github-sync-fork/' +
  'omjaffmdnnkgmbbjmdalehkjcaklleii). If there aren\'t any conflicts ' +
  'then this PR will be merged automatically else, ' +
  'you will need to resolve conflicts and merge manually.' +
  '\n\n' +
  'If you\'re facing issues with this extension, please read the [wiki]' +
  '(https://github.com/whizzzkid/github-sync-fork-chrome-ext/wiki) ' +
  'first. If still facing an issue, report them ' +
  '[here](https://github.com/whizzzkid/github-sync-fork-chrome-ext' +
  '/issues/new).' +
  '\n\n' +
  '[Whizzzkid](https://nishantarora.in)';

GSF.hitMeBabyOneMoreTime = function (func) {
  setTimeout(func.bind(this), this.LoopTime);
}

GSF.generateUpdateUrl = function (upstream) {
  var repoURI = document.querySelector('strong[itemprop="name"]').baseURI.match(/^[^\?]+/)[0];
  return repoURI + '/compare/master...' + upstream +
    this.Stages.CREATE_PR_STAGE;
};

GSF.renderButton = function (count, upstream) {
  var url = this.generateUpdateUrl(upstream);
  var head = document.querySelector('ul.pagehead-actions');
  head.innerHTML = '<li><a href="' + url +
    '" class="btn btn-sm btn-with-count" id="gsf-butt" title="Sync Fork"' +
    'aria-label="Sync Fork">Sync Fork</a><a href="' + url +
    '" class="social-count" title="' + count +
    ' commits available for update." aria-label="' + count +
    ' commits available for update.">' + count + '</a></li>' + head.innerHTML;
};

GSF.isUpdateAvailable = function () {
  if (!document.querySelector('a#gsf-butt')) {
    var [ info ] = document.querySelectorAll('div.branch-infobar');
    // new UI
    if (!info) {
        var [ filePanel ] = document.querySelectorAll('div.file-navigation');
        var nextEl = filePanel.nextElementSibling;
        for (let i = 0; i < 4; i++) {
            if (nextEl.classList.contains('Box-body')) {
                info = nextEl;
                break;
            } else {
                if (!nextEl.nextElementSibling) {
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }
        }
    }

    if (info) {
        console.log(info);
      var updateRegExp = /(\d+) commits behind ([^\.]+)/g;
      [message, commits, upstream] = updateRegExp.exec(info.innerText);
      this.renderButton(commits, upstream);
    }
    // will keep looking for the infobar.
    this.hitMeBabyOneMoreTime(this.isUpdateAvailable);
  }
};

GSF.approvePR = function () {
  var mergeButton = document.querySelector(
    'div.mergeability-details').querySelector(
    'div.btn-group-merge').querySelector(
    'button.js-details-target');
  if (!mergeButton.disabled) {
    document.querySelector(
      'form.merge-branch-form').querySelector(  'button[value=merge]').click();
  } else {
    // probably show a message
  }
};

GSF.isThisMyPR = function () {
  return (
    this.Location.href.match(/\/pull\//g) &&
    document.querySelector(
      'span.js-issue-title').innerText.trim() == this.Messages.PR_TITLE
  );
};

GSF.createPR = function () {
  var existing = document.querySelector('a.existing-pull-button');
  if (existing) {
    existing.click();
  } else {
    document.querySelector(
        'input#pull_request_title').value = this.Messages.PR_TITLE;
    document.querySelector(
        'textarea#pull_request_body').value = this.Messages.PR_BODY;
    document.querySelector('form#new_pull_request').submit();
  }
};

GSF.isThisAFork = function () {
  return (document.querySelectorAll('span.fork-flag').length == 1);
};

GSF.init = function () {
  if (this.isThisAFork()) {
    if (this.Location.hash == this.Stages.CREATE_PR_STAGE) {
      this.createPR();
    } else if (this.isThisMyPR()) {
      this.approvePR();
    } else {
      this.isUpdateAvailable();
    }
  }
};

GSF.onUrlChangeListener = function () {
  if (this.Location.href != window.location.href) {
    console.log('Location changed!');
    this.Location = JSON.parse(JSON.stringify(window.location));
    this.init();
  }
  this.hitMeBabyOneMoreTime(this.onUrlChangeListener);
};

GSF.onUrlChangeListener();
