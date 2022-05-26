import { t } from 'i18next'
import React from 'react'

const AgainDrawerContent = () => {
  return (
    <div className='againDrawerContent'>
      <span className="title">{t('SendMember')}</span>
      <div className="addPeople">
        <span className='tip'>'sdfsfesaefaea asdfasfd aefasdfa'</span>
      </div>
      <span className="title">{t('EditContent')}</span>
      <textarea className="editContent" placeholder={t('PleaseEnterTheContent')}></textarea>
      <span className="btn">{t('OnekeySend')}</span>
    </div>
  )
}
export default AgainDrawerContent