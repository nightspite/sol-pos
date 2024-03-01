import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface SimplePaginationProps {
  className?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  pageIndex: number;
  pageCount: number;
  setPageIndex: (pageIndex: number) => void;
  showPageCount?: boolean;
  simplePageCount?: boolean;
}

export const SimplePagination = ({
  className,
  hasPreviousPage,
  hasNextPage,
  pageIndex,
  pageCount,
  setPageIndex,
  showPageCount,
  simplePageCount,
}: SimplePaginationProps) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        className="hidden h-8 w-8 p-0 lg:flex"
        disabled={!hasPreviousPage}
        onClick={() => {
          setPageIndex(0);
        }}
        variant="outline"
      >
        <span className="sr-only">Go to first page</span>
        <ChevronsLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        className="h-8 w-8 p-0"
        disabled={!hasPreviousPage}
        onClick={() => {
          setPageIndex(pageIndex - 1);
        }}
        variant="outline"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      {showPageCount ? (
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {simplePageCount ? (
            <>
              {pageIndex + 1} of {pageCount || 1}
            </>
          ) : (
            <>
              Page {pageIndex + 1} of {pageCount || 1}
            </>
          )}
        </div>
      ) : null}

      <Button
        className="h-8 w-8 p-0"
        disabled={!hasNextPage}
        onClick={() => {
          setPageIndex(pageIndex + 1);
        }}
        variant="outline"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
      <Button
        className="hidden h-8 w-8 p-0 lg:flex"
        disabled={!hasNextPage}
        onClick={() => {
          setPageIndex(pageCount - 1);
        }}
        variant="outline"
      >
        <span className="sr-only">Go to last page</span>
        <ChevronsRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
