import React from 'react'
import { Input, Button} from '@mui/material';

interface FormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  name: string;
}

function Form({ onSubmit }: FormProps) {
  const [formData, setFormData] = React.useState<FormData>({ name: ''});

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="Black">
        <Input sx={{width: "300px"}} type="text" name="name" placeholder="Or, enter a public ordinals address here" value={formData.name} onChange={handleInputChange} />
      </label>
      <br />

      <Button sx={{color: "#000000"}} type="submit">Submit</Button>
    </form>
  );
}

export default Form;  