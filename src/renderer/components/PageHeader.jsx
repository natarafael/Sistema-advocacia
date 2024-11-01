import { Typography } from '@mui/material';

export default function PageHeader({ title }) {
  return (
    <div className="lg:flex lg:items-center lg:justify-between m-5">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}
