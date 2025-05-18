// Import Dependencies
import { Description, Label, Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { forwardRef } from "react";

// ----------------------------------------------------------------------

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DocumentType = forwardRef(
  ({ value, onChange, documentTypes, name }, ref) => {
    return (
      <RadioGroup
        ref={ref}
        value={documentTypes.find((doc) => doc.key === value) || null}
        onChange={(val) => onChange(val.key)}
        name={name}
      >
        <Label className="sr-only">Document Type</Label>
        <div className="mt-2 grid w-full gap-3 xl:grid-cols-3">
          {documentTypes.map((type) => (
            <Radio
              key={type.key}
              value={type}
              className={({ active, checked }) =>
                clsx(
                  active && "ring-2 ring-primary-500/50",
                  checked
                    ? "bg-primary-500 text-white"
                    : "bg-gray-150 dark:bg-dark-600",
                  "relative flex cursor-pointer rounded-lg px-3 py-4 outline-hidden transition-colors",
                )
              }
            >
              {({ checked }) => (
                <div className="flex w-full items-center justify-between space-x-2 ">
                  <div className="flex min-w-0 items-center space-x-3 ">
                    <type.icon className="size-5.5 shrink-0" />
                    <div className="min-w-0 text-sm">
                      <Label
                        as="p"
                        className={`truncate font-medium ${
                          checked
                            ? "text-white"
                            : "text-gray-900 dark:text-dark-50"
                        }`}
                      >
                        {type.label}
                      </Label>
                      <Description
                        as="div"
                        className={`mt-0.5 truncate text-xs ${
                          checked
                            ? "text-primary-100"
                            : "text-gray-500 dark:text-dark-200"
                        }`}
                      >
                        {type.description}
                      </Description>
                    </div>
                  </div>
                  {checked && (
                    <div className="shrink-0 text-white">
                      <CheckIcon className="size-6" />
                    </div>
                  )}
                </div>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>
    );
  },
);

DocumentType.displayName = "DocumentType";

DocumentType.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  documentTypes: PropTypes.array,
};

export { DocumentType };
