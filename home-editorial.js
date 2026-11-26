'use strict';

const select = selector => document.querySelector(selector);
const navigation = select('#navigation');
const stageGoals = [
  '从辨认熟悉的事物开始，在说、找、配对中积累词汇。',
  '在归类、比较和表达中，发现词语与概念之间的联系。',
  '观察汉字的形旁和部件，从字形寻找意义线索。',
  '比较同一家族的汉字，把部件、字义与书写联系起来。'
];
// Keys are item numbers from the corresponding game-box catalog.
const featuredGames = [
  [
    [1, '把小狗、小猫和猴子的图片与名字拼在一起。'],
    [17, '叠放颜色卡和动物卡，说出“蓝色的鸟”。']
  ],
  [
    [1, '把樱桃、山楂和杏的图片与词卡拼在一起。'],
    [7, '掷出一种表情，说说什么时候会有这种心情。'],
  ],
  [
    [1, '拼出小狗，再找一找“猫”“狗”“猪”左边相同的部件。'],
    [10, '观察太阳和“日”的字形，再在田字格里写一写。'],
  ],
  [
    [16, '翻看“鸣”的部件，想一想“口”和“鸟”怎样合起来表示叫声。'],
    [20, '观察衣服的图形，与“衣”字配对，再找找它们相像的地方。']
  ]
];
const levelButtons = [...document.querySelectorAll('[data-level]')];
function showLevel(button) {
  const index = Number(button.dataset.level) - 1;
  const box = window.GAMEBOX_CATALOG[index];
  for (const option of levelButtons) option.setAttribute('aria-pressed', String(option === button));
  select('#box-photo').src = 'assets/package-' + box.level + '.webp';
  select('#box-photo').alt = box.name + '游戏盒';
  select('#level-name').textContent = box.name + '游戏盒';
  select('#level-goal').textContent = stageGoals[index];
  select('#level-count').textContent = box.count;
  select('#level-catalog').href = 'games.html?level=' + box.level;

  const examples = featuredGames[index].map(([number, instruction]) => {
    const group = box.groups.find(group => group.items.some(item => item.number === number));
    const item = group.items.find(item => item.number === number);
    const sample = document.createElement('article');
    const photo = document.createElement('img');
    photo.src = item.display_image || item.image;
    photo.alt = '';
    const name = document.createElement('h4');
    name.textContent = item.title;
    const kind = document.createElement('span');
    kind.textContent = group.name;
    const description = document.createElement('p');
    description.textContent = instruction;
    sample.append(photo, kind, name, description);
    return sample;
  });
  select('.kit-examples').replaceChildren(...examples);
}
for (const button of levelButtons) button.addEventListener('click', () => showLevel(button));
showLevel(levelButtons[0]);
const combine = select('#combine');
const glyph = select('#glyph');
const parts = document.querySelectorAll('.hanzi-tiles .radical');
combine.addEventListener('click', () => {
  const joined = glyph.hidden;
  for (const part of parts) part.hidden = joined;
  glyph.hidden = !joined;
  glyph.textContent = joined ? '明' : '';
  combine.setAttribute('aria-pressed', String(joined));
  combine.querySelector('.combine-label').textContent = joined ? '再分开看' : '合起来看';
});

const lessonVideo = select('.weather-player video');
const startLesson = select('#start-lesson');
startLesson.hidden = false;
lessonVideo.controls = false;
startLesson.addEventListener('click', async () => {
  lessonVideo.controls = true;
  try {
    await lessonVideo.play();
    startLesson.hidden = true;
    lessonVideo.focus();
  } catch {
    // Keep the native controls available for retrying playback.
    startLesson.hidden = true;
  }
});
lessonVideo.addEventListener('ended', () => {
  startLesson.hidden = false;
  lessonVideo.controls = false;
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navLinks = [...navigation.querySelectorAll('a')];
const currentSection = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of navLinks) {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}, {rootMargin: '-48% 0px -48%'});
for (const section of document.querySelectorAll('main > section')) currentSection.observe(section);

// Keep each puppet's hands anchored while it leans toward the pointer.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
for (const perch of document.querySelectorAll('.perch')) {
  const puppet = perch.querySelector('.puppet');
  perch.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = perch.getBoundingClientRect();
    const offset = (event.clientX - bounds.left) / bounds.width - .5;
    puppet.style.setProperty('--look', offset * 11 + 'deg');
    puppet.style.setProperty('--lean', offset * 2.5 + 'deg');
  });
  perch.addEventListener('pointerleave', () => {
    puppet.style.removeProperty('--look');
    puppet.style.removeProperty('--lean');
  });
}
