import { Option } from '../../types/Option';

const Select = ({ options }: { options: Option[] }) => {
  return (
    <div className="select is-rounded">
      <select>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
