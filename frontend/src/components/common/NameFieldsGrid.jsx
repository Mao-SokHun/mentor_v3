import clsx from 'clsx'

/** Khmer UI: family name (last) before given name (first); English: first then last. */
export default function NameFieldsGrid({ isKhmer, className, firstNameField, lastNameField }) {
  return (
    <div className={clsx('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {isKhmer ? (
        <>
          {lastNameField}
          {firstNameField}
        </>
      ) : (
        <>
          {firstNameField}
          {lastNameField}
        </>
      )}
    </div>
  )
}
