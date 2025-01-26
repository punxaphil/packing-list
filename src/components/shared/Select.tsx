import { Option } from '../../types/Option';

const Select = ({
  options,
  value,
  setSelection,
}: {
  options: Option[];
  value: number;
  setSelection: (value: number) => void;
}) => {
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelection(parseInt(e.target.value));
  }

  //const selectedOption = options.find((option) => option.value === value);
  return (
    <div className="select is-rounded">
      <select onChange={onChange}>
        {options.map((option, index) => (
          <option  key={index} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
