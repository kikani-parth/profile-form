//import * as React from 'https://cdn.skypack.dev/react@17.0.1';
//import * as ReactDOM from 'https://cdn.skypack.dev/react-dom@17.0.1';
// import ReactDOM from 'react-dom/client';
import React, { ChangeEvent, InputHTMLAttributes, FormEvent } from 'react';

interface MockPostProps {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  receiveNewsletter?: boolean;
}

// "Server-side" code
const mockPost = (
  profile: MockPostProps
): Promise<{
  errors?: { path: string; message: string; [key: string]: unknown }[];
  profile?: MockPostProps;
}> =>
  new Promise((resolve) => {
    const errors: { path: string; message: string }[] = [];

    if (!profile.firstName)
      errors.push({ path: 'firstName', message: 'Missing first name!' });
    if (!profile.lastName)
      errors.push({ path: 'lastName', message: 'Missing last name!' });
    if (!profile.phoneNumber) {
      errors.push({ path: 'phoneNumber', message: 'Missing phone number!' });
    } else if (profile.phoneNumber.replace(/[^0-9]/, '').length !== 8) {
      errors.push({
        path: 'phoneNumber',
        message: 'Phone number must be 8 digits',
      });
    }

    if (errors.length > 0) {
      resolve({ errors });
      return;
    }

    resolve({ profile });
  });

// Client side code below

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
    name: string
  ) => void;
}

interface CheckboxInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
    name: string
  ) => void;
}

const TextInput = ({ onChange, ...props }: TextInputProps) => (
  <input
    onChange={(event) => onChange(event, event.target.value, event.target.name)}
    {...props}
  />
);

const CheckboxInput = ({ onChange, ...props }: CheckboxInputProps) => (
  <input
    type="checkbox"
    onChange={(event) =>
      onChange(event, event.target.checked, event.target.name)
    }
    {...props}
  />
);

interface ProfileFormState {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  receiveNewsletter?: boolean;
  errors: { [key: string]: string } | null;
}

class ProfileForm extends React.Component {
  state: ProfileFormState = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    receiveNewsletter: false,
    errors: null,
  };

  onInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string,
    name: string
  ) => {
    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handler for checkbox input changes
  onCheckboxChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
    name: string
  ) => {
    this.setState((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ errors: null });

    const { firstName, lastName, phoneNumber, receiveNewsletter } = this.state;
    const response = await mockPost({
      firstName,
      lastName,
      phoneNumber,
      receiveNewsletter,
    });

    if (response.errors) {
      const errorObj: { [key: string]: string } = {};

      response.errors.forEach((error) => {
        errorObj[error.path] = error.message;
      });
      this.setState((prevState) => ({ ...prevState, errors: errorObj }));
    } else {
      this.setState({ errors: null });
    }

    if (response.profile) {
      this.setState((prevState) => ({
        ...prevState,
        ...response.profile,
      }));
    }
  };

  render() {
    const { firstName, lastName, phoneNumber, receiveNewsletter, errors } =
      this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <label>
          First name:{' '}
          <TextInput
            name="firstName"
            value={firstName}
            onChange={this.onInputChange}
          />
        </label>
        {errors ? (
          <span style={{ color: 'red', marginLeft: '10px' }}>
            {errors.firstName}
          </span>
        ) : (
          ''
        )}

        <br />
        <br />

        <label>
          Last name:{' '}
          <TextInput
            name="lastName"
            value={lastName}
            onChange={this.onInputChange}
          />
        </label>
        {errors ? (
          <span style={{ color: 'red', marginLeft: '10px' }}>
            {errors.lastName}
          </span>
        ) : (
          ''
        )}

        <br />
        <br />

        <label>
          Phone number:{' '}
          <TextInput
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={this.onInputChange}
          />
        </label>
        {errors ? (
          <span style={{ color: 'red', marginLeft: '10px' }}>
            {errors.phoneNumber}
          </span>
        ) : (
          ''
        )}

        <br />
        <br />

        <label>
          Receive newsletter?{' '}
          <CheckboxInput
            name="receiveNewsletter"
            checked={receiveNewsletter}
            onChange={this.onCheckboxChange}
          />
        </label>

        <br />
        <br />

        <button type="submit">Save changes</button>
      </form>
    );
  }
}

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// root.render(<ProfileForm />);

export default ProfileForm;
