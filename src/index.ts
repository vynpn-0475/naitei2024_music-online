import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import session from 'express-session';
import flash from 'connect-flash';
import router from './routes/index';
import methodOverride from 'method-override';

import { AppDataSource } from './config/data-source';

const app = express();

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
  });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(middleware.handle(i18next));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(methodOverride('_method'));

    app.use('/', router);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      res.status(500);
      res.render('error');
      next();
    });

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
