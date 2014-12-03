#WingPad

![David](https://david-dm.org/yandex-shri-minsk-2014/team-1.png)
[![Issue Stats](http://issuestats.com/github/yandex-shri-minsk-2014/team-1/badge/pr)](http://issuestats.com/github/yandex-shri-minsk-2014/team-1)
[![Issue Stats](http://issuestats.com/github/yandex-shri-minsk-2014/team-1/badge/issue)](http://issuestats.com/github/yandex-shri-minsk-2014/team-1)

## Инсталяция и запуск

##### Единая команда запуска приложения:
* `node start.js` -- загружает все зависимости, запускает gulp работу и затем сервер

## Структура проекта:

- `blocks/` -- frontend. Client code (html, css, js) should be placed into appropriate blocks
- `config/` -- basic app config (currently - port numbers)
- `server/` -- backend. Entity descriptions (user, document) and request processing logic (e.g. operational transformation).

## Вклад в проект:

##### Инфраструктура:
- настройка jshint;
- PreCommit Hooks (codestyle);
- jasmine+karma (tests);
- имплементация gulp-работ по сборке ресурсов;
- node-deploy;

##### Сервер:
- разработка цветового сопровождения пользователей;
- переход от socketio --> websocket;
- имплементация сохранения документов без доп ajax запросов на получение и посылку документа;

##### Клиент:
- разработка цветового сопровождения пользователей;
- переход от socketio --> websocket;
- имплементация отображения выделения текста другими пользователями;
- введен header.js в котором сосредоточилась логика по управлению элементами расположенными в хедере;
- введен header.html тем самым страница продолжила существовать в качестве набора блоков;
- были покрыты тестами roster, header, page(функционал по работе с пользователями);

