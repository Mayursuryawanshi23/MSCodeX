import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Breadcrumbs = ({ separator = ' / ' }) => {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-400 py-2 px-4">
      <ol className="flex items-center gap-1">
        <li>
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
        </li>
        {parts.map((part, i) => {
          const path = '/' + parts.slice(0, i + 1).join('/');
          const isLast = i === parts.length - 1;
          // nice label: replace hyphens and lowercase
          const label = decodeURIComponent(part).replace(/-/g, ' ');
          return (
            <li key={path} className="flex items-center">
              <span className="mx-2 text-gray-500">{separator}</span>
              {isLast ? (
                <span aria-current="page" className="text-gray-100">{label}</span>
              ) : (
                <Link to={path} className="text-gray-300 hover:text-white">{label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
