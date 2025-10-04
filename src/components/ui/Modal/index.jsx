import PropTypes from "prop-types";
import { forwardRef } from "react";
import { createPortal } from "react-dom";
import clsx from 'clsx';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../Button";

const Modal = forwardRef(({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
  blur = false,
  highPriority = false,
  showFooter = true,
  ...rest
}, ref) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  return createPortal(
    <div className={clsx(
      "fixed inset-0 overflow-y-auto",
      highPriority ? "z-[99999]" : "z-50"
    )}>
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Overlay */}
        <div
          className={clsx(
            "fixed inset-0 transition-opacity",
            blur
              ? "backdrop-blur-sm bg-black/30"
              : "bg-black bg-opacity-50"
          )}
          onClick={onClose}
        />

        {/* Modal container */}
        <div
          ref={ref}
          className={clsx(
            "relative transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 text-left shadow-xl transition-all w-full",
            sizeClasses[size],
            className
          )}
          {...rest}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-500">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              icon={<XMarkIcon className="h-5 w-5" />}
              aria-label="Fermer"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            {children}
          </div>

          {/* Footer (optionnel) */}
          {showFooter && (
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-dark-500">
              <Button variant="outlined" onClick={onClose}>
                Annuler
              </Button>
              <Button variant="primary">
                Confirmer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});

Modal.displayName = "Modal";

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl", "full"]),
  className: PropTypes.string,
  blur: PropTypes.bool,
  highPriority: PropTypes.bool,
  showFooter: PropTypes.bool
};

export { Modal };