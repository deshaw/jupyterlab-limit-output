import { limitByCharacters, limitByLines } from '../src/formatters';
import { expect } from 'chai';

describe('renders utils', () => {
  describe('limit by characters', () => {
    const splitter =
      /^(?<head>.*?)\n{0,3}WARNING:.+characters.\n{0,3}(?<tail>.*?)$/s;
    const str = 'abc\n\ndefg\nhijkl\nnopqrs\ntuvwxyz012345\n789';
    it('limits by starting characters', () => {
      const splitOutput = splitter.exec(limitByCharacters(str, 7, 0));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('abc\n\nde');
      expect(splitOutput.groups.tail).to.equal('');
    });
    it('limits by ending characters', () => {
      const splitOutput = splitter.exec(limitByCharacters(str, 0, 6));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('');
      expect(splitOutput.groups.tail).to.equal('45\n789');
    });
    it('limits by both starting and ending characters', () => {
      const splitOutput = splitter.exec(limitByCharacters(str, 7, 6));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('abc\n\nde');
      expect(splitOutput.groups.tail).to.equal('45\n789');
    });
    it('does not limit if input is small', () => {
      const output = limitByCharacters(str, 700, 600);
      expect(output).to.equal(str);
    });
  });
  describe('limit by lines', () => {
    const splitter =
      /^(?<head>.*?)\n{0,3}WARNING:.+lines.\n{0,3}(?<tail>.*?)$/s;
    const str = 'abc\n\ndefg\nhijkl\nnopqrs\ntuvwxyz012345\n789';
    it('limits by starting lines', () => {
      const splitOutput = splitter.exec(limitByLines(str, 3, 0));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('abc\n\ndefg');
      expect(splitOutput.groups.tail).to.equal('');
    });
    it('limits by ending lines', () => {
      const splitOutput = splitter.exec(limitByLines(str, 0, 2));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('');
      expect(splitOutput.groups.tail).to.equal('\ntuvwxyz012345\n789');
    });
    it('limits by both starting and ending lines', () => {
      const splitOutput = splitter.exec(limitByLines(str, 3, 2));
      expect(splitOutput).to.exist;
      expect(splitOutput.groups.head).to.equal('abc\n\ndefg');
      expect(splitOutput.groups.tail).to.equal('\ntuvwxyz012345\n789');
    });
    it('does not limit if input is small', () => {
      const output = limitByLines(str, 700, 600);
      expect(output).to.equal(str);
    });
  });
});
