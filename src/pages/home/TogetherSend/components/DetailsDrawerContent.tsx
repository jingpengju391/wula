import { t } from 'i18next'
import React from 'react'

const DetailsDrawerContent = () => {
  return (
    <div className='detailsDrawerContent'>
      <span className="title">{t('SendMember')}</span>
      <div className="addPeople">
        <span className='tip'>skfjskdjfk   lsdjflkasfjklas   lskdjflasjdflk</span>
      </div>
      <span className="title">{t('SendContent')}</span>
      <textarea disabled className="editContent" >sdfsetasdrasersdfasefraws</textarea>
    </div>
  )
}
export default DetailsDrawerContent