import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const changeLanguage = (event) => {
    const lng = event.target.value;
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120, marginLeft: 2 }}>
      <InputLabel id="language-label">🌐</InputLabel>
      <Select
        labelId="language-label"
        id="language-select"
        value={i18n.language}
        onChange={changeLanguage}
        label="🌐"
        sx={{ color: 'white' }}
        
      >
        <MenuItem value="en">{t('language.english')}</MenuItem>
        <MenuItem value="fr">{t('language.french')}</MenuItem>
        <MenuItem value="ar">{t('language.arabic')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
